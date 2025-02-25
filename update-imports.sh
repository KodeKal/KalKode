#!/bin/bash

# Files to update
declare -A files=(
  ["src/pages/shop/LiveShopCreation.js"]="s|import { DEFAULT_THEME } from '../../theme/theme'|import { DEFAULT_THEME } from '../../theme/config/themes'|"
  ["src/pages/shop/ShopPage.js"]="s|import { DEFAULT_THEME } from '../../theme/theme'|import { DEFAULT_THEME } from '../../theme/config/themes'|"
  ["src/components/ThemeSelector/ThemeSelector.js"]="s|import { THEMES, DEFAULT_THEME } from '../../constants/themes'|import { THEME_VARIANTS, DEFAULT_THEME } from '../../theme/config/themes'|"
  ["src/components/FontSelector.js"]="s|import { FONT_OPTIONS } from '../constants/themes'|import { FONT_OPTIONS } from '../theme/config/fonts'|"
  ["src/App.js"]="s|import { DEFAULT_THEME } from './theme/theme'|import { DEFAULT_THEME } from './theme/config/themes'|"
)

# Loop through files and update imports
for file in "${!files[@]}"; do
  if [ -f "$file" ]; then
    sed -i "${files[$file]}" "$file"
    echo "Updated imports in $file"
  else
    echo "Warning: $file not found"
  fi
done

echo "Import updates completed!"
