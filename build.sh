#!/bin/bash
rm -R lib
npm run ts-build
cp -R bin lib