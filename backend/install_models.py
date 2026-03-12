"""
Download and install Argos Translate language models.
These are neural network models used by CTranslate2 for machine translation.

Usage:
  python install_models.py

To add more languages, add tuples to the PAIRS list below.
"""
import argostranslate.package
import zipfile
import os
import shutil

PACKAGES_DIR = os.path.expanduser(os.path.join('~', '.local', 'share', 'argos-translate', 'packages'))

# Add language pairs here. Each tuple is (from_code, to_code).
# Available codes: ar, az, bn, ca, cs, da, de, el, en, eo, es, fa, fi, fr, ga, gl, he, hi, hu, id, it, ja, ko, ky, ms, nl, pl, pt, ru, sk, sq, sv, tr, uk, ur, zh
PAIRS = [
    ('en', 'ar'),
    ('ar', 'en'),
]

def install_models():
    print("Updating Argos Translate package index...")
    argostranslate.package.update_package_index()
    pkgs = argostranslate.package.get_available_packages()
    os.makedirs(PACKAGES_DIR, exist_ok=True)

    for from_code, to_code in PAIRS:
        key = f'translate-{from_code}_{to_code}'
        dest = os.path.join(PACKAGES_DIR, key)

        if os.path.exists(dest):
            print(f"  [SKIP] {from_code} -> {to_code} (already installed)")
            continue

        pkg = next((p for p in pkgs if p.from_code == from_code and p.to_code == to_code), None)
        if not pkg:
            print(f"  [WARN] Model not found: {from_code} -> {to_code}")
            continue

        print(f"  [DOWN] Downloading {from_code} -> {to_code}...")
        path = pkg.download()
        with zipfile.ZipFile(path, 'r') as z:
            z.extractall(dest)
        print(f"  [DONE] Installed {key}")

    print(f"\nAll models installed to: {PACKAGES_DIR}")


if __name__ == '__main__':
    install_models()
