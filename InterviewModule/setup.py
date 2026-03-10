"""
Setup configuration for AI Interview Assessment System
Install this package to use it in other applications
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="ai-interview-assessment",
    version="1.0.0",
    author="Your Name",
    author_email="your.email@example.com",
    description="AI-powered interview assessment system using computer vision, speech recognition, and NLP",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/ai-interview-assessment",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.0",
            "pytest-cov>=3.0",
            "black>=22.0",
            "flake8>=4.0",
        ],
        "api": [
            "flask>=3.0",
            "gunicorn>=20.1",
        ],
        "async": [
            "celery>=5.3",
            "redis>=4.5",
        ],
    },
    entry_points={
        "console_scripts": [
            "interview-analyzer=app.cli:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.task", "*.pth", "*.json"],
    },
)
