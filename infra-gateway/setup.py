from setuptools import setup, find_packages

setup(
    name="gateway-cli",
    version="1.0.0",
    description="CLI tool to compile abstract gateway policies and manage Nginx, Apache, and Traefik instances.",
    author="DevOps Team",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_ok=True,
    install_requires=[
        "pyyaml>=6.0"
    ],
    entry_points={
        "console_scripts": [
            "gateway-cli=gateway_cli.main:main",
        ],
    },
    python_requires=">=3.8",
)
