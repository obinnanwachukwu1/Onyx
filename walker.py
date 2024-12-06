import os
import sys

SKIP_EXTENSIONS = ('.png', '.jpg', '.jpeg')

def walk_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(SKIP_EXTENSIONS):
                continue
            file_path = os.path.join(root, file)
            print(f"> {file_path}")
            with open(file_path, 'r') as f:
                print(f.read())

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python walker.py <folder_location>")
        sys.exit(1)
    
    folder_location = sys.argv[1]
    walk_directory(folder_location)
