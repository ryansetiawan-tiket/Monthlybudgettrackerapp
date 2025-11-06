#!/bin/bash

# Documentation Migration Script
# Moves all .md files from root to /docs/changelog/
# Date: November 5, 2025

echo "🚀 Starting documentation migration..."

# Create destination folder if not exists
mkdir -p docs/changelog

# List of files to move (excluding README.md which stays in root)
files=(
  "CIRCULAR_REFERENCE_FIX.md"
  "DIALOG_20_PERCENT_LARGER_SUMMARY.md"
  "DIALOG_SIZE_FIX.md"
  "DIALOG_SIZE_FIX_QUICK_REF.md"
  "HOOK_INTEGRATION_BUG_FIXES.md"
  "HOOK_INTEGRATION_BUG_FIXES_COMPLETE.md"
  "LAZY_LOADING_FIX_QUICK_REF.md"
  "LAZY_LOADING_STARTTRANSITION_FIX.md"
  "MULTIPLE_ENTRY_EXPENSE.md"
  "PERFORMANCE_FIX_POCKETS_LOADING.md"
  "PERFORMANCE_FIX_QUICK_REF.md"
  "PERFORMANCE_FIX_TIMELINE_LOADING.md"
  "PERFORMANCE_FIX_TIMELINE_QUICK_REF.md"
  "PHASE3_AND_PHASE4_COMPLETION_SUMMARY.md"
  "PHASE3_PLANNING_SESSION_SUMMARY.md"
  "PHASE3_SESSION1_COMPLETE.md"
  "PHASE3_SESSION5_QUICK_REF.md"
  "REALTIME_FEATURE_QUICK_REF.md"
  "REALTIME_POCKET_FEATURE.md"
  "REALTIME_UPDATE_FIX.md"
  "REALTIME_UPDATE_QUICK_REF.md"
  "SETISOPEN_ERROR_FIX.md"
  "SKELETON_LOADING_QUICK_REF.md"
  "SKELETON_LOADING_UPDATE.md"
  "TODAY_ACHIEVEMENTS_NOV5_2025.md"
  "TOGGLE_POCKETS_FEATURE.md"
  "TOGGLE_POCKETS_QUICK_REF.md"
)

# Counter
moved=0
failed=0

# Move each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📄 Moving $file..."
    mv "$file" "docs/changelog/$file"
    if [ $? -eq 0 ]; then
      ((moved++))
      echo "✅ Moved: $file"
    else
      ((failed++))
      echo "❌ Failed: $file"
    fi
  else
    echo "⚠️  Not found: $file"
    ((failed++))
  fi
done

echo ""
echo "═══════════════════════════════════"
echo "📊 Migration Complete!"
echo "═══════════════════════════════════"
echo "✅ Successfully moved: $moved files"
echo "❌ Failed/Not found: $failed files"
echo "📁 Destination: /docs/changelog/"
echo "═══════════════════════════════════"
echo ""
echo "🎉 All documentation organized!"

# Optional: List files in destination
echo "📂 Files in /docs/changelog/:"
ls -1 docs/changelog/ | grep ".md$"
