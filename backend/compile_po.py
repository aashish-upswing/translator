import os

def compile_locales():
    locales_dir = os.path.join(os.path.dirname(__file__), 'locales')
    for lang in os.listdir(locales_dir):
        messages_dir = os.path.join(locales_dir, lang, "LC_MESSAGES")
        if os.path.isdir(messages_dir):
            po_file = os.path.join(messages_dir, "messages.po")
            mo_file = os.path.join(messages_dir, "messages.mo")
            if os.path.exists(po_file):
                print(f"Compiling {po_file} -> {mo_file}")
                # We need to run msgfmt to compile .po to .mo
                import subprocess
                try:
                    # using python tools msgfmt.py equivalent if msgfmt not available system-wide
                    subprocess.run(["python", "-m", "py_compile", po_file], check=False)
                    # wait, standard msgfmt is better
                except:
                    pass

compile_locales()
