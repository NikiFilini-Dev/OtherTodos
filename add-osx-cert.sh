#!/usr/bin/env sh

echo $MACOS_CERTIFICATE | base64 —decode > certificate.p12
security create-keychain -p keychainPassword build.keychain security default-keychain -s build.keychain
security unlock-keychain -p keychainPassword build.keychain
security import certificate.p12 -k build.keychain -P $MACOS_CERTIFICATE_PWD -T /usr/bin/codesign
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k keychainPassword build.keychain

security find-identity

# remove certs
rm -fr *.p12