/****************************************
                File IO
           Written By Tim Hyde
       Version 1.0.0: 2019-05-04
*****************************************/
/*
The Functions:
~~ ModifyDataFile(<string filename>,<string comma_separated_key_value_pairs>)
This function writes a csv file with two rows and arbitrary column count.
It is intended intended as script storage for properties or attributes or script data.
The file is not encrypted.
This function will create a new file with the columns specified in the key value pairs
OR it will update an existing file, but only existing columns.
If additional columns are needed please specify a new file name, or delete the old one and make new.

~~ ReadValue(<string filename>,<string <key_name>,<pass_s>)
This function returns the value stored for a specified key

~~ReadKeyValue(<string filename>,<integer record_number>,<pass_s>)
This function returns the key value pair in the form "key=value" for a specifed index

~~ ReadCountKeys(<string filename>,<pass_s>)
This function returns the number of keys in the file.

~~ ReadDump(<string filename>,<pass_s>)
This function returns the contents of the file in 2d array 2xN

All functions have the optional parameter <pass_s> whic if supplied will encrypt or decrypt the file with the rc4 algorithm.
The function cipher(<key>,<data>) applies the rc4 stream cipher algorithm.
*/
function ModifyDataFile(name,key_value_s,pass_s){
//name: The filename.
//key_value_s: comma separated string of key value pairs eg "name=example,email=ex@amp.le"
//This function will replace any file by the same name and create new if doesn't exist.
//If the file exists will not modify fields headers, but will update rows
   
    var header="";
    var values="";
    var attrib_s=[];
    
    function ParseKVP(kv){
      //parse string into csv format
      var attrib=kv.split("=");
      header=header.concat(",",attrib[0]);
      values=values.concat(",",attrib[1]);
      attrib_s.push(attrib);
    }
    //if encryption defined, then the file names will have an RC4 in the extention
    if(pass_s!==undefined){
        name=name.concat(".RC4");
    }
    
    //get the data file in csv form - if it doesnt exist it is created, otherwise it is updated.
    var csvfile=GetFile(name);
    if (csvfile!=null){
        var blob=csvfile.getBlob();
        var data=blob.getDataAsString();
        
        //if encryption defined decrypte the data
        if(pass_s!==undefined){
            data=cipher(pass_s,data);
        }
        var  csv=Utilities.parseCsv(data,",");
        
        //for each attribute in attrib_s find the matching one in the data
        var key_value=key_value_s.split(",");
        key_value.forEach(ParseKVP);
        
        //Update the CSV array file with new values
        //only existing values are changed. New values are not added.
        //To add new value use a new filename and thus new file
        for(i=0;i<attrib_s.length;i++){
            for(j=0;j<csv[0].length;j++){
                if(attrib_s[i][0]==csv[0][j]){
                    csv[1][j]=attrib_s[j][1];
                }
            }
        }
        //concatenate the csv into a string
        var newcsv=new String("");
        for(var j=0;j<csv.length;j++){
            for(var i=0;i<csv[0].length;i++){
                newcsv=newcsv.concat(csv[j][i]);
                if((i+1)<csv[0].length){
                    newcsv=newcsv.concat(",");
                }
            }
            newcsv=newcsv.concat("\n");            
        }
        newcsv=newcsv.trim();
        
        //if encryption defined reencrypt the file
        if(pass_s!==undefined){
            newcsv=cipher(pass_s,newcsv);
        }
        //update the file on google drive
        csvfile.setContent(newcsv);
    }
    else
    {
        //create new csv file from the supplied key value pairs
         var key_value=key_value_s.split(",");
         key_value.forEach(ParseKVP);
         header=header.replace(",","");
         values=values.replace(",","");
         var csv=header.concat("\n",values);
         
         //if encryption defined encrypt the file
         if(pass_s!==undefined){
         csv=cipher(pass_s,csv);
         }         
         
         //Create the blob
         var blobcsv=Utilities.newBlob(csv,MimeType.PLAIN_TEXT,name.concat(".dat"));
         DriveApp.createFile(blobcsv)
    }
}

//Function to get file pointer from drive based on file name.
function GetFile(name){
    //try to find the blob file
    var iterator=DriveApp.getFilesByName(name.concat(".dat"));
    //check if file exists
    if(iterator.hasNext()==true)
    {
          //Th File exists - get it
          var file=iterator.next();
          //var blob=file.getBlob();
          return file;
    } else {return null;}
}

//read a value from the file specified by name
function ReadValue(name,keyname,pass_s){
    
    //if encryption defined, then the file names will have an RC4 in the extention
    if(pass_s!==undefined){
        name=name.concat(".RC4");
    }
    
    //get the file
    var file=GetFile(name);
    var blob=file.getBlob();
    var value;
    if(blob!=null){
        var data=blob.getDataAsString();
        
        //if encryption defined, then decrypt
        if(pass_s!==undefined){
            data=cipher(pass_s,data);
        }
        
        //parse the csv data and extract
        var  csv=Utilities.parseCsv(data,",");
        for(i=0;i<csv.length;i++){
            if(csv[0][i]==keyname){
                value=csv[1][i];
                break;
            }
        }
    return value;
    }
    else
    {return null;    }
}


//read a key value pair from the file based on the record number
function ReadKeyValue(name,record_num,pass_s){
    //if encryption defined, then the file names will have an RC4 in the extention
    if(pass_s!==undefined){
        name=name.concat(".RC4");
    }
    
    //get the data
    var file=GetFile(name);
    var blob=file.getBlob();
    if(blob!=null){
        var data=blob.getDataAsString();
        
        //if encryption defined decrypt
        if(pass_s!==undefined){
            data=cipher(pass_s,data);
        }
        
        //parse csv and extract
        var  csv=Utilities.parseCsv(data,",");
        return csv[0][record_num].concat("=",csv[1][record_num]);
    }
    else {return null;}
}


//get the total key count.
function ReadCountKeys(name,encrypt_bool,pass_s){
    //if encryption defined, then the file names will have an RC4 in the extention
    if(pass_s!==undefined){
        name=name.concat(".RC4");
    }
    
    //get the file
    var file=GetFile(name);
    var blob=file.getBlob();
    if(blob!=null){
        var data=blob.getDataAsString();
        
        //if encryption defined decryption the file
        if(pass_s!==undefined){
            data=cipher(pass_s,data);
        }
        
        //parse the csv and extract
        var  csv=Utilities.parseCsv(data,",");
        return csv[0].length;
    }
    else {return null;}
}


//get the whole file as 2D array (2 rows x n columns)
function ReadDump(name,encrypt_bool,pass_s){
    //if encryption defined, then the file names will have an RC4 in the extention
    if(pass_s!==undefined){
        name=name.concat(".RC4");
    }
    
    //get the filed date
    var file=GetFile(name);
    var blob=file.getBlob();
    if(blob!=null){
        var data=blob.getDataAsString();
        
        //if encryption defined decrypt the file
        if(pass_s!==undefined){
            data=cipher(pass_s,data);
        }
        
        //parse the csv and extract
        var  csv=Utilities.parseCsv(data,",");
        return csv
    }
    else {return null;}
}
