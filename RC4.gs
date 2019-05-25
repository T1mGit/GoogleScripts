/*
This is the RC4 Stream ciper published in
Computer Security Principles and Practise, 3rd edition. Stallings and Brown (2015) pp.673-674
tweaked for Google Script.
This function takes as input a string password and a string data. Binary data should be converted to base 64 or some other character reperesentation.
The function returns a an encrypted string.
*/
function cipher(K,data) {
    var s=new Array(256);
    var t=new Array(256);
    // K the key as string;
    var keylen=K.length;
    //Initialisation
    for(var i=0;i<256;i++){
        s[i]=i;
        t[i]=K.charCodeAt(i%keylen);
    }
    //inital permution
    var j=0;
    for(i=0;i<256;i++){
        j=(j+s[i]+t[i])%256;
        //swap
        var x=s[i];
        s[i]=s[j];
        s[j]=x;
    }
    //Stream generation
    var b=0;
    var bytes=new Array(data.length);
    var i=0; var j=0;
    while(b<data.length){
        i=(i+1)%256;
        j=(j+s[i])%256;
        //swap
        var x=s[i];
        s[i]=s[j];
        s[j]=x;
        
        var T=(s[i]+s[j])%256;
        var k=s[T];
        bytes[b]=data.charCodeAt(b)^k;
        b++;
    }
    var output="";
    for(i=0;i<bytes.length;i++){
        output=output.concat(String.fromCharCode(bytes[i]));
    }
    return output;
}

function encBlob(password,blob){
var b64=Utilities.base64Encode(blob.getBytes());
var enc=cipher(password,b64);
return Utilities.base64Encode(enc);
}
function decBlob64s(password,blob64s){
var enc="";
var a=Utilities.base64Decode(blob64s);
  for(i=0;i<a.length;i++){
    enc=enc.concat(String.fromCharCode(a[i]));
  }
 var dec=cipher(password,enc);
 var blob=Utilities.base64decode(dec);
 return blob;
 }
 
