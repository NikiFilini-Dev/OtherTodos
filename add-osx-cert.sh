#!/usr/bin/env sh

echo $MACOS_CERTIFICATE_APP | base64 --decode > certificate_app.p12
echo $MACOS_CERTIFICATE_INST | base64 --decode > certificate_inst.p12

security create-keychain -p keychainPassword build.keychain
security default-keychain -s build.keychain
security unlock-keychain -p keychainPassword build.keychain

security import certificate_app.p12 -k build.keychain -P $MACOS_CERTIFICATE_APP_PWD -T /usr/bin/codesign
security import certificate_inst.p12 -k build.keychain -P $MACOS_CERTIFICATE_INST_PWD -T /usr/bin/codesign

security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k keychainPassword build.keychain

security find-identity

# remove certs
rm -fr *.p12