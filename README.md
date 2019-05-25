# GoogleScripts
Scripts I'm working on for doing stuff on google drive

<h2>FileIO.gs</h2>
This file reads and writes-modifies csv structured files of size 2R x nC.
It is intended for convenient access key value pairs, which may be used to store script data in the form of configuration information.
The ModifyDataFile() function will update an existing file or create a new one if the file does not exists.
It will not extend and existing file, instead a new file must be created.
It will optionally encrypt the using the RC4 cipher if supplied with passphrase.

<h2>RC4.gs</h2>
This file is required for FileIO.gs to perform the encryption.
The cipher() function applies the RC4 cipher to an input AppsScript string and returns a string.
To encrypt a blob  of binary data, a transform should first be applied such a base64.
