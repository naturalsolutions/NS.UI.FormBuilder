#!/bin/bash

output="All.js"

echo "// generated by lolzors script $0" > $output
echo "define([" >> $output

for i in ./*; do
  [ $i = "./$output" ] && continue
  [ "${i##*.}" != "js" ] && continue
  i=${i%.*}
  echo "  \"$i\"," >> $output
done

echo "], function(" >> $output


for i in *; do
  [ $i = "$output" ] && continue
  [ "${i##*.}" != "js" ] && continue
  i=${i%.*}
  echo "  $i," >> $output
done

echo ") {" >> $output
echo "  return {" >> $output
for i in *; do
  [ $i = "$output" ] && continue
  [ "${i##*.}" != "js" ] && continue
  i=${i%.*}
  echo "    $i: $i," >> $output
done

echo "  };" >> $output
echo "});" >> $output
