import argostranslate.package

print("Updating Argos Translate package index...")
argostranslate.package.update_package_index()
available_packages = argostranslate.package.get_available_packages()

def install_model(from_code, to_code):
    print(f"Searching for model: {from_code} -> {to_code}")
    package_to_install = next(
        filter(
            lambda x: x.from_code == from_code and x.to_code == to_code, available_packages
        ), None
    )
    
    if package_to_install:
        print(f"Found model: {package_to_install}. Downloading and installing...")
        argostranslate.package.install_from_path(package_to_install.download())
        print("Installation complete.")
    else:
        print(f"Error: Model {from_code} -> {to_code} not found.")

if __name__ == "__main__":
    install_model("en", "ar")
    install_model("ar", "en") # Might as well get both directions
    print("Done installing language models.")
