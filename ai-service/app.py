
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from io import BytesIO
from pypdf import PdfReader
from docx import Document
import re

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "IntelliCheck AI Service is running!"
    })


def extract_text(file):
    filename = file.filename.lower()
    content = file.read()

    if filename.endswith(".txt"):
        return content.decode("utf-8", errors="ignore")

    elif filename.endswith(".pdf"):
        reader = PdfReader(BytesIO(content))
        return "\n".join(
            page.extract_text() or ""
            for page in reader.pages
        )

    elif filename.endswith(".docx"):
        document = Document(BytesIO(content))
        return "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        )

    raise ValueError("Unsupported file type")


def clean_text(text):
    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def calculate_similarity(text1, text2):
    text1 = clean_text(text1)
    text2 = clean_text(text2)

    if not text1 or not text2:
        raise ValueError("Both documents must contain readable text.")

    # Word and phrase similarity
    word_vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        sublinear_tf=True,
        stop_words="english"
    )

    word_vectors = word_vectorizer.fit_transform(
        [text1, text2]
    )

    word_score = cosine_similarity(
        word_vectors[0], word_vectors[1]
    )[0][0]

    # Character pattern similarity
    char_vectorizer = TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=(3, 5),
        sublinear_tf=True
    )

    char_vectors = char_vectorizer.fit_transform(
        [text1, text2]
    )

    char_score = cosine_similarity(
        char_vectors[0], char_vectors[1]
    )[0][0]

    # Combined lexical similarity
    final_score = (0.75 * word_score) + (0.25 * char_score)

    return round(float(final_score) * 100, 2)


def split_sentences(text):
    sentences = re.split(r'(?<=[.!?])\s+|\n+', text)

    return [
        sentence.strip()
        for sentence in sentences
        if len(sentence.strip().split()) >= 5
    ]


def find_matching_passages(text1, text2, limit=5):
    sentences1 = split_sentences(text1)
    sentences2 = split_sentences(text2)

    if not sentences1 or not sentences2:
        return []

    all_sentences = sentences1 + sentences2

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        stop_words="english"
    )

    try:
        vectors = vectorizer.fit_transform(all_sentences)
    except ValueError:
        return []

    first_vectors = vectors[:len(sentences1)]
    second_vectors = vectors[len(sentences1):]

    scores = cosine_similarity(
        first_vectors,
        second_vectors
    )

    matches = []

    for i in range(len(sentences1)):
        for j in range(len(sentences2)):
            score = float(scores[i][j]) * 100

            if score >= 25:
                matches.append({
                    "passage1": sentences1[i],
                    "passage2": sentences2[j],
                    "similarity_percentage": round(score, 2)
                })

    matches.sort(
        key=lambda item: item["similarity_percentage"],
        reverse=True
    )

    return matches[:limit]


@app.route("/compare", methods=["POST"])
def compare_texts():
    try:
        data = request.get_json() or {}

        text1 = data.get("text1", "")
        text2 = data.get("text2", "")

        score = calculate_similarity(text1, text2)

        matches = find_matching_passages(text1, text2)

        return jsonify({
            "similarity_percentage": score,
            "matched_passages": matches,
            "message": "Text comparison completed successfully."
        })

    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/compare-files", methods=["POST"])
def compare_files():
    try:
        file1 = request.files.get("file1")
        file2 = request.files.get("file2")

        if not file1 or not file2:
            return jsonify({
                "error": "Please provide two files."
            }), 400

        text1 = extract_text(file1)
        text2 = extract_text(file2)

        if not text1.strip() or not text2.strip():
            return jsonify({
                "error": "Could not extract text from one or both files."
            }), 400

        score = calculate_similarity(text1, text2)

        matches = find_matching_passages(text1, text2)

        return jsonify({
            "similarity_percentage": score,
            "matched_passages": matches,
            "file1": file1.filename,
            "file2": file2.filename,
            "message": "File comparison completed successfully."
        })

    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    except Exception as error:
        return jsonify({"error": str(error)}), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=8000,
        debug=True
    )
