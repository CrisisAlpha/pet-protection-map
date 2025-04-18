import os
import math
import time
import requests
from concurrent.futures import ThreadPoolExecutor

# Hong Kong bounding box
MIN_LAT, MAX_LAT = 22.15, 22.55
MIN_LON, MAX_LON = 113.8, 114.4

# Zoom levels to download
ZOOM_LEVELS = [11, 12, 13]

# Add User-Agent to avoid being blocked
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; PetProtectionMapTiles/1.0; +http://localhost)'
}

def latlon_to_tile(lat, lon, zoom):
    """Convert lat/lon to tile coordinates"""
    lat_rad = math.radians(lat)
    n = 2.0 ** zoom
    xtile = int((lon + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return (xtile, ytile)

def download_tile(zoom, x, y, max_retries=3):
    """Download a single tile with retry logic"""
    url = f"https://tile.openstreetmap.org/{zoom}/{x}/{y}.png"
    path = f"public/tiles/{zoom}/{x}/{y}.png"
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(path), exist_ok=True)
    
    # Download tile if it doesn't exist
    if not os.path.exists(path):
        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=HEADERS)
                if response.status_code == 200:
                    with open(path, 'wb') as f:
                        f.write(response.content)
                    print(f"Successfully downloaded tile: {zoom}/{x}/{y}")
                    return True
                elif response.status_code == 429:  # Too Many Requests
                    print(f"Rate limited on tile {zoom}/{x}/{y}, waiting before retry...")
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    print(f"Failed to download tile {zoom}/{x}/{y}: HTTP {response.status_code}")
            except Exception as e:
                print(f"Error downloading tile {zoom}/{x}/{y} (attempt {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(1)
        return False
    else:
        print(f"Tile already exists: {zoom}/{x}/{y}")
        return True

def main():
    print("Starting tile download for Hong Kong...")
    
    # Calculate tile ranges for the bounding box
    for zoom in ZOOM_LEVELS:
        # Get tile coordinates for corners
        nw_x, nw_y = latlon_to_tile(MAX_LAT, MIN_LON, zoom)  # Northwest corner
        se_x, se_y = latlon_to_tile(MIN_LAT, MAX_LON, zoom)  # Southeast corner
        
        # Ensure correct order of coordinates
        min_x, max_x = min(nw_x, se_x), max(nw_x, se_x)
        min_y, max_y = min(nw_y, se_y), max(nw_y, se_y)
        
        print(f"\nDownloading zoom level {zoom}...")
        print(f"Tile range: x={min_x}-{max_x}, y={min_y}-{max_y}")
        
        total_tiles = (max_x - min_x + 1) * (max_y - min_y + 1)
        print(f"Total tiles to download: {total_tiles}")
        
        # Download tiles in parallel with rate limiting
        with ThreadPoolExecutor(max_workers=2) as executor:
            futures = []
            for x in range(min_x, max_x + 1):
                for y in range(min_y, max_y + 1):
                    futures.append(executor.submit(download_tile, zoom, x, y))
                    time.sleep(0.1)  # Rate limiting
            
            # Wait for all downloads to complete
            successful = 0
            for future in futures:
                if future.result():
                    successful += 1
            
            print(f"\nZoom level {zoom} complete: {successful}/{total_tiles} tiles downloaded")
    
    print("\nTile download completed!")

if __name__ == "__main__":
    main() 