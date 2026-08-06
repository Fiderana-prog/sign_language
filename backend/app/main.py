from __future__ import annotations

import os

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import json
import subprocess
import tempfile
from pathlib import Path
from threading import Lock
from typing import Any

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps


try:
    tf.config.set_visible_devices([], "GPU")
except RuntimeError:
    pass


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "model"

WORDS_MODEL_PATH = MODEL_DIR / "asl20_words_full.keras"
WORDS_CLASSES_PATH = MODEL_DIR / "asl20_class_names.json"

ALPHABET_MODEL_PATH = MODEL_DIR / "asl_alphabet_ensemble.keras"
ALPHABET_CLASSES_PATH = MODEL_DIR / "asl_alphabet_class_names.json"

MAX_UPLOAD_SIZE = 120 * 1024 * 1024
MIN_VALID_FRAMES = 8

ENGLISH_TO_FRENCH = {
    "baby": "bébé",
    "eat": "manger",
    "father": "père",
    "finish": "terminer",
    "good": "bien",
    "happy": "heureux",
    "hear": "entendre",
    "house": "maison",
    "important": "important",
    "love": "aimer",
    "mall": "centre commercial",
    "me": "moi",
    "mosque": "mosquée",
    "mother": "mère",
    "normal": "normal",
    "sad": "triste",
    "stop": "arrêter",
    "thanks": "merci",
    "thinking": "penser",
    "worry": "s'inquiéter",
}


def read_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise RuntimeError(f"Fichier introuvable : {path}")

    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


WORDS_METADATA = read_json(WORDS_CLASSES_PATH)
ALPHABET_METADATA = read_json(ALPHABET_CLASSES_PATH)

WORDS_CLASSES: list[str] = WORDS_METADATA["class_names"]
ALPHABET_CLASSES: list[str] = ALPHABET_METADATA["class_names"]

IMAGE_SIZE = int(WORDS_METADATA.get("image_size", 224))
SEQUENCE_LENGTH = int(WORDS_METADATA.get("sequence_length", 30))
DECODE_FPS = int(WORDS_METADATA.get("decode_fps", 8))
ALPHABET_IMAGE_SIZE = int(ALPHABET_METADATA.get("image_size", 224))


def load_keras_model(path: Path) -> tf.keras.Model:
    if not path.exists():
        raise RuntimeError(f"Modèle introuvable : {path}")

    return tf.keras.models.load_model(path, compile=False)


WORDS_MODEL: tf.keras.Model | None = None
ALPHABET_MODEL: tf.keras.Model | None = None

WORDS_MODEL_LOCK = Lock()
ALPHABET_MODEL_LOCK = Lock()


def get_words_model() -> tf.keras.Model:
    global WORDS_MODEL

    if WORDS_MODEL is not None:
        return WORDS_MODEL

    with WORDS_MODEL_LOCK:
        if WORDS_MODEL is None:
            print("Chargement du modèle ASL mots...", flush=True)
            WORDS_MODEL = load_keras_model(WORDS_MODEL_PATH)
            print("Modèle ASL mots chargé.", flush=True)

    return WORDS_MODEL


def get_alphabet_model() -> tf.keras.Model:
    global ALPHABET_MODEL

    if ALPHABET_MODEL is not None:
        return ALPHABET_MODEL

    with ALPHABET_MODEL_LOCK:
        if ALPHABET_MODEL is None:
            print("Chargement du modèle alphabet ASL...", flush=True)
            ALPHABET_MODEL = load_keras_model(ALPHABET_MODEL_PATH)
            print("Modèle alphabet ASL chargé.", flush=True)

    return ALPHABET_MODEL


app = FastAPI(
    title="SignVerse Multi-Model API",
    version="2.0.0",
    description=(
        "Reconnaissance des mots ASL dynamiques et de "
        "l'alphabet ASL statique."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "https://sign-language-5grl.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def shape_to_json(shape: Any) -> Any:
    if isinstance(shape, list):
        return [shape_to_json(item) for item in shape]

    try:
        return [
            int(value) if value is not None else None
            for value in shape
        ]
    except TypeError:
        return str(shape)


def resize_with_padding(
    image: Image.Image,
    image_size: int,
) -> np.ndarray:
    image = image.convert("RGB")

    resized = ImageOps.contain(
        image,
        (image_size, image_size),
        method=Image.Resampling.LANCZOS,
    )

    canvas = Image.new(
        "RGB",
        (image_size, image_size),
        color=(0, 0, 0),
    )

    x_offset = (image_size - resized.width) // 2
    y_offset = (image_size - resized.height) // 2

    canvas.paste(resized, (x_offset, y_offset))

    # Les deux modèles contiennent leur prétraitement interne.
    # On conserve donc les pixels dans l'intervalle 0-255.
    return np.asarray(canvas, dtype=np.float32)


def open_image(image_path: Path, image_size: int) -> np.ndarray:
    try:
        with Image.open(image_path) as image:
            return resize_with_padding(image, image_size)
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Image invalide : {error}",
        ) from error


def image_to_word_sequence(
    image_path: Path,
) -> tuple[np.ndarray, np.ndarray, int]:
    frame = open_image(image_path, IMAGE_SIZE)

    frames = np.repeat(
        frame[None, ...],
        repeats=SEQUENCE_LENGTH,
        axis=0,
    ).astype(np.float32)

    mask = np.ones(
        (SEQUENCE_LENGTH,),
        dtype=np.float32,
    )

    return frames, mask, SEQUENCE_LENGTH


def video_to_word_sequence(
    video_path: Path,
) -> tuple[np.ndarray, np.ndarray, int]:
    frame_size_bytes = IMAGE_SIZE * IMAGE_SIZE * 3
    max_video_seconds = 20
    max_decoded_frames = DECODE_FPS * max_video_seconds

    video_filter = (
        f"fps={DECODE_FPS},"
        f"scale={IMAGE_SIZE}:{IMAGE_SIZE}:"
        "force_original_aspect_ratio=decrease,"
        f"pad={IMAGE_SIZE}:{IMAGE_SIZE}:"
        "(ow-iw)/2:(oh-ih)/2:color=black"
    )

    command = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel", "fatal",
        "-fflags", "+discardcorrupt",
        "-err_detect", "ignore_err",
        "-i", str(video_path),
        "-map", "0:v:0",
        "-an",
        "-sn",
        "-dn",
        "-t", str(max_video_seconds),
        "-vf", video_filter,
        "-frames:v", str(max_decoded_frames),
        "-pix_fmt", "rgb24",
        "-f", "rawvideo",
        "pipe:1",
    ]

    try:
        result = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=120,
            check=False,
        )
    except FileNotFoundError as error:
        raise HTTPException(
            status_code=500,
            detail="FFmpeg n'est pas installé ou absent du PATH.",
        ) from error
    except subprocess.TimeoutExpired as error:
        raise HTTPException(
            status_code=408,
            detail="Le décodage de la vidéo a dépassé le délai.",
        ) from error

    raw_bytes = result.stdout
    frame_count = len(raw_bytes) // frame_size_bytes

    if frame_count == 0:
        diagnostic = result.stderr.decode(
            "utf-8",
            errors="ignore",
        ).strip()

        raise HTTPException(
            status_code=400,
            detail=diagnostic or "Aucune frame n'a pu être extraite.",
        )

    useful_byte_count = frame_count * frame_size_bytes

    decoded_frames = np.frombuffer(
        raw_bytes[:useful_byte_count],
        dtype=np.uint8,
    ).reshape(
        frame_count,
        IMAGE_SIZE,
        IMAGE_SIZE,
        3,
    )

    if frame_count > SEQUENCE_LENGTH:
        selected_indices = np.linspace(
            0,
            frame_count - 1,
            num=SEQUENCE_LENGTH,
            dtype=np.int32,
        )
        decoded_frames = decoded_frames[selected_indices]

    valid_count = min(len(decoded_frames), SEQUENCE_LENGTH)

    if valid_count < MIN_VALID_FRAMES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Vidéo trop courte ou illisible : "
                f"{valid_count} frames valides."
            ),
        )

    frames = np.zeros(
        (
            SEQUENCE_LENGTH,
            IMAGE_SIZE,
            IMAGE_SIZE,
            3,
        ),
        dtype=np.float32,
    )

    mask = np.zeros(
        (SEQUENCE_LENGTH,),
        dtype=np.float32,
    )

    frames[:valid_count] = decoded_frames[
        :valid_count
    ].astype(np.float32)

    mask[:valid_count] = 1.0

    return frames, mask, valid_count


def top_predictions(
    probabilities: np.ndarray,
    class_names: list[str],
    translation_builder,
) -> list[dict[str, Any]]:
    top_indices = np.argsort(probabilities)[::-1][:3]

    predictions = []

    for index in top_indices:
        class_name = class_names[int(index)]

        predictions.append(
            {
                "word": class_name,
                "translation": translation_builder(class_name),
                "confidence": float(probabilities[int(index)]),
            }
        )

    return predictions


def predict_word_sequence(
    frames: np.ndarray,
    mask: np.ndarray,
    valid_frames: int,
    mode: str,
) -> dict[str, Any]:
    words_model = get_words_model()

    probabilities = words_model.predict(
        [
            frames[None, ...].astype(np.float32),
            mask[None, ...].astype(np.float32),
        ],
        verbose=0,
    )[0]

    return {
        "model_type": "words",
        "mode": mode,
        "valid_frames": valid_frames,
        "sequence_length": SEQUENCE_LENGTH,
        "predictions": top_predictions(
            probabilities,
            WORDS_CLASSES,
            lambda word: ENGLISH_TO_FRENCH.get(word, word),
        ),
    }


def alphabet_label(symbol: str) -> str:
    if symbol.isdigit():
        return f"Chiffre {symbol}"

    return f"Lettre {symbol.upper()}"


def predict_alphabet_image(
    image_path: Path,
) -> dict[str, Any]:
    image = open_image(
        image_path,
        ALPHABET_IMAGE_SIZE,
    )

    alphabet_model = get_alphabet_model()

    probabilities = alphabet_model.predict(
        image[None, ...].astype(np.float32),
        verbose=0,
    )[0]

    return {
        "model_type": "alphabet",
        "mode": "image",
        "valid_frames": 1,
        "predictions": top_predictions(
            probabilities,
            ALPHABET_CLASSES,
            alphabet_label,
        ),
    }


async def save_upload(file: UploadFile) -> Path:
    suffix = Path(file.filename or "").suffix.lower()

    with tempfile.NamedTemporaryFile(
        suffix=suffix,
        delete=False,
    ) as temporary_file:
        total_size = 0

        while True:
            chunk = await file.read(1024 * 1024)

            if not chunk:
                break

            total_size += len(chunk)

            if total_size > MAX_UPLOAD_SIZE:
                Path(temporary_file.name).unlink(missing_ok=True)

                raise HTTPException(
                    status_code=413,
                    detail="Le fichier dépasse la limite de 120 Mo.",
                )

            temporary_file.write(chunk)

        return Path(temporary_file.name)


@app.get("/")
def root() -> dict[str, Any]:
    return {
        "message": "SignVerse Multi-Model API",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/health")
def render_health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "status": "online",
        "version": "2.0.0",
        "models": {
            "words": {
                "name": WORDS_MODEL_PATH.name,
                "available": WORDS_MODEL_PATH.exists(),
                "loaded": WORDS_MODEL is not None,
                "class_count": len(WORDS_CLASSES),
                "classes": WORDS_CLASSES,
                "image_size": IMAGE_SIZE,
                "sequence_length": SEQUENCE_LENGTH,
                "decode_fps": DECODE_FPS,
            },
            "alphabet": {
                "name": ALPHABET_MODEL_PATH.name,
                "available": ALPHABET_MODEL_PATH.exists(),
                "loaded": ALPHABET_MODEL is not None,
                "class_count": len(ALPHABET_CLASSES),
                "classes": ALPHABET_CLASSES,
                "image_size": ALPHABET_IMAGE_SIZE,
            },
        },
    }


@app.post("/api/predict/video")
async def predict_word_video(
    file: UploadFile = File(...),
) -> dict[str, Any]:
    temporary_path = await save_upload(file)

    try:
        frames, mask, valid_count = video_to_word_sequence(
            temporary_path
        )

        return predict_word_sequence(
            frames=frames,
            mask=mask,
            valid_frames=valid_count,
            mode="video",
        )
    finally:
        temporary_path.unlink(missing_ok=True)


@app.post("/api/predict/image")
async def predict_word_image(
    file: UploadFile = File(...),
) -> dict[str, Any]:
    temporary_path = await save_upload(file)

    try:
        frames, mask, valid_count = image_to_word_sequence(
            temporary_path
        )

        result = predict_word_sequence(
            frames=frames,
            mask=mask,
            valid_frames=valid_count,
            mode="image",
        )

        result["warning"] = (
            "Le modèle de mots a été entraîné sur des vidéos. "
            "Le test avec une seule image reste expérimental."
        )

        return result
    finally:
        temporary_path.unlink(missing_ok=True)


@app.post("/api/predict/alphabet")
async def predict_alphabet(
    file: UploadFile = File(...),
) -> dict[str, Any]:
    temporary_path = await save_upload(file)

    try:
        return predict_alphabet_image(temporary_path)
    finally:
        temporary_path.unlink(missing_ok=True)