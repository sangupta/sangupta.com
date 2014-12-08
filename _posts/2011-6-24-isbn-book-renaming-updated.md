---
layout: post
title: ISBN Book Renaming | Updated
permalink: /tech/isbn-book-renaming-updated.html
redirect_from: "/2011/06/isbn-book-renaming-updated.html"
date: Fri Jun 24 14:21:00 IST 2011
sharingURL: http://blog.sangupta.com/2011/06/isbn-book-renaming-updated.html
tags: java my-projects tools
---

They say necessity is the mother of all invention. That's right! As per my previous post 
<a href="http://blog.sangupta.com/2011/06/isbn-book-renaming.html">ISBN Book Renaming</a>, I 
had coded a small command line tool that helps in renaming books as per their ISBN number. As 
my father lay hands on the tools, and started using it, he found it useful but also complained 
that it lagged features, and yes, was buggy in a way ;)

So here is an update on the command line tool, with the following new features and a couple of small bug fixes:

* Adds support to retain the ISBN number as the prefix or the suffix when renaming the book
* Fixes bugs when there are child folders in the folder supplied
* Some housekeeping issues

Details on using the tool and where to grab the latest download are available 
<a href="http://goo.gl/nBtpI">here</a>. You can download a copy of this version of the tool from 
<a href="http://code.google.com/p/sangupta/downloads/detail?name=ISBNBookRenamer-1.1-b3.jar&amp;can=2">my Google Code repository</a>.

Hope this helps!

The source code for the tool is as under,

```java
package com.sangupta.isbntools;
 
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
 
/**
 * Command line tool to rename the files in a folder picking the filename to be
 * the ISBN number and hitting the webservice at http://isbndb.com for getting
 * the filename.
 * 
 * All folders and any file ending in extension ZIP are skipped.
 * 
 * Update 24 Jun 2011: Updated to include options for renaming files per different schemes 
 * and a few small bug fixes. 
 * 
 * @author sangupta
 * @since 18 Jun 2011
 * @version 1.1
 */
public class ISBNBookRenamer {
 
 /**
  * The API key for the site http://isbndb.com where we get the book names
  * from the ISBN code
  */
 private static final String ISBNDB_API_KEY = "";
 
 /**
  * The API end point that will be hit
  */
 private static final String API_URL = "http://isbndb.com/api/books.xml?access_key=" + ISBNDB_API_KEY + "&index1=isbn&value1=";
 
 private static int renamingOption = 0;
 
 /**
  * The main entry point.
  * 
  * @param args
  */
 public static void main(String[] args) {
  // check for proper usage
  if (args.length < 1) {
   usage();
   return;
  }
 
  if (args.length == 2) {
   renamingOption = args[1].charAt(0) - 48;
   if (renamingOption != 1 && renamingOption != 2) {
    System.out.println("Wrong arguments provided, check usage... exiting!\n");
    usage();
    return;
   }
  }
 
  // perform sanity checks
 
  String folderPath = args[0];
  File folder = new File(folderPath);
 
  if (!folder.exists()) {
   System.out
     .println("The folder path you specified does not exists.");
   return;
  }
 
  if (!folder.isDirectory()) {
   System.out.println("The path you specified is not a folder.");
   return;
  }
 
  // get a list of all files
  File[] files = folder.listFiles();
  if (files == null || files.length == 0) {
   System.out.println("No file in folder to work upon.");
   return;
  }
 
  for (File localFile : files) {
   if (localFile.isFile()) {
    renameBook(localFile);
   }
  }
 
  System.out.println("\nDone!\n");
 }
 
 /**
  * Displays the usage information on the tool.
  */
 private static void usage() {
  System.out.println("Usage: ");
  System.out.println("       $ java -jar ISBNBookRenamer <folder> [renamingOption]");
  System.out.println("              folder: the folder where all books are stored");
  System.out.println("              renamingOption: an optional integral parameter tht specifies on how to rename the file");
  System.out.println("                  <not specified/default> : isbn.pdf will be renamed as filename.pdf");
  System.out.println("                  1 : isbn.pdf will be renamed as filename_isbn.pdf");
  System.out.println("                  2 : isbn.pdf will be renamed as isbn_filename.pdf");
 }
 
 /**
  * Processes the given file and renames the file as per ISBN bookname if
  * possible.
  * 
  * @param localFile
  */
 private static void renameBook(File localFile) {
  String fileName = localFile.getName();
  String parentFolder = localFile.getParent();
 
  // strip off name and extension
  String name = null, extension = null;
  int extensionIndex = fileName.lastIndexOf('.');
  if (extensionIndex != -1) {
   name = fileName.substring(0, extensionIndex);
   extension = fileName.substring(extensionIndex + 1);
   if (!extension.equalsIgnoreCase("pdf")) {
    System.out.println("Filename " + fileName + "extension is not PDF... skipping!");
    return;
   }
  }
 
  if (name != null && name.length() != 10) {
   System.out.println("Filename " + fileName + " is not 10 characters long... skipping!");
   return;
  }
 
  // now fetch the ISBN name for the book
  String bookName = getISBNBookName(name);
  if (bookName == null) {
   System.out.println("Unable to fetch book name for file: " + fileName + "... skipping!");
   return;
  }
 
  // rename the book
  bookName = sanitizeBookName(bookName);
 
  String newFileName = "";
  switch (renamingOption) {
  case 1:
   newFileName = bookName + '_' + name + '.' + extension;
   break;
  case 2:
   newFileName = name + '_' + bookName + '.' + extension;
   break;
  default:
   newFileName = bookName + '.' + extension;
  }
 
  File newFile = new File(parentFolder + File.separatorChar + newFileName);
 
  System.out.println("Renaming " + fileName + " to " + newFileName);
 
  boolean success = localFile.renameTo(newFile);
 
  if (!success) {
   System.out.println("Failed renaming " + fileName + " to "
     + newFileName);
   return;
  }
 
 }
 
 /**
  * Sanitize the bookname and remove characters that cannot be a part of the
  * filename
  * 
  * @param bookName
  * @return
  */
 public static String sanitizeBookName(String bookName) {
  bookName = bookName.replace(':', '_');
  bookName = remove(bookName, 'â');
  bookName = remove(bookName, ',');
  bookName = remove(bookName, '˘');
  bookName = remove(bookName, '„');
  return bookName;
 }
 
 public static String remove(String str, char remove) {
  if (isEmpty(str) || str.indexOf(remove) == -1) {
   return str;
  }
  char[] chars = str.toCharArray();
  int pos = 0;
  for (int i = 0; i < chars.length; i++) {
   if (chars[i] != remove) {
    chars[pos++] = chars[i];
   }
  }
  return new String(chars, 0, pos);
 }
 
 private static boolean isEmpty(String str) {
  if (str == null || str.length() == 0) {
   return true;
  }
 
  return false;
 }
 
 /**
  * Given the ISBN number, return the bookname as possible.
  * 
  * @param name
  * @return
  */
 private static String getISBNBookName(String name) {
  String urlToHit = API_URL + name;
 
  // hit the webservice
  HttpURLConnection conn = null;
  InputStream in = null;
  BufferedReader rd = null;
  try {
   conn = (HttpURLConnection) (new URL(urlToHit)).openConnection();
   conn.setRequestMethod("GET");
 
   int responseCode = conn.getResponseCode();
   if (responseCode != HttpURLConnection.HTTP_OK) {
    in = conn.getErrorStream();
    rd = new BufferedReader(new InputStreamReader(in));
    String tempLine = rd.readLine();
    StringBuilder response = new StringBuilder();
    while (tempLine != null) {
     response.append(tempLine).append("\n");
     tempLine = rd.readLine();
    }
 
    System.out.println("Unable to get book name for " + name + " with error: " + response.toString());
   } else {
    in = conn.getInputStream();
    rd = new BufferedReader(new InputStreamReader(in));
    String tempLine = rd.readLine();
    StringBuilder response = new StringBuilder();
    while (tempLine != null) {
     response.append(tempLine).append("\n");
     tempLine = rd.readLine();
    }
 
    String xml = response.toString();
    System.out.println("XML response returned is: " + xml);
 
    int titleIndexStart = xml.indexOf("<Title>");
    if (titleIndexStart == -1) {
     System.out.println("Unable to get book title via XML response: " + xml);
     return null;
    }
 
    int titleIndexEnd = xml.indexOf("</Title>", titleIndexStart);
    String bookName = xml.substring(titleIndexStart + 7, titleIndexEnd);
    return bookName;
   }
  } catch (MalformedURLException e) {
   System.out.println("Unable to get book name for book " + name);
   e.printStackTrace();
  } catch (IOException e) {
   System.out.println("Unable to get book name for book " + name);
   e.printStackTrace();
  } finally {
   if (conn != null) {
    conn.disconnect();
   }
 
   if (rd != null) {
    try {
     rd.close();
    } catch (IOException e) {
     e.printStackTrace();
    }
   }
 
   if (in != null) {
    try {
     in.close();
    } catch (IOException e) {
     e.printStackTrace();
    }
   }
  }
 
  return null;
 }
 
}
```
