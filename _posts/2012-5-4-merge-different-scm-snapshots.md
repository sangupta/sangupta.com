---
layout: post
title: Merge different SCM snapshots
permalink: /tech/merge-different-scm-snapshots.html
redirect_from: "/2012/05/merge-different-scm-snapshots.html"
date: Fri May 04 15:09:00 IST 2012
sharingURL: http://blog.sangupta.com/2012/05/merge-different-scm-snapshots.html
tags: java tools workarounds
---

This post is about MergeRepo a small script that allows to merge two different snapshots of 
the same repository from different SCMs into one.

Recently, I had to collaborate on a project where the code was in Subversion. As we usually 
use Perforce, we forked a copy of the `SVN` trunk into `Perforce` and started our development. Once, 
the development was complete, we wanted to merge back in Subversion. And now, the nightmare 
started. SVN showed all files (thousands) to have been modified, due to a change in the timestamp 
or the change in line-ending character.

The issue with line-ending character was easier to resolve, but the change in timestamp still 
created havoc. Thus, the need for this tool emerged. I wrote this simple script to ignore 
timestamp, and  `EOL` character, and merge the removed/added/modified files back into the `SVN` 
folder, so that only such files were shown for commit.

The tool allows us to resolve such situations. It compares the two snapshots (folders/trees) and 
generates the merged repository with the only the modified files, so that it can be checked back 
into the original line. The tool can be used as,

```
Usage:    $ java com.sangupta.keepwalking.MergeRepo <previous> <newer> <destination>
 
          previous      The folder corresponding to the older repository snapshot.
          newer         The folder corresponding to the newer repository snapshot.
          destination   The folder where the updated repository will be created.
```

The source code for the same is available on my 
<a href="https://github.com/sangupta/BlogExamples/blob/master/KeepWalking/src/com/sangupta/keepwalking/MergeRepo.java">GitHub repository</a>, or below.

```java
/**
 *
 * MergeRepo - allows to merge two different snapshots of the same repository
 * Copyright (c) 2012, Sandeep Gupta
 * 
 * Read more at http://blog.sangupta.com
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * 		http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 */

package com.sangupta.keepwalking;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.filefilter.FileFilterUtils;
import org.apache.commons.io.filefilter.IOFileFilter;
import org.apache.commons.io.filefilter.TrueFileFilter;

/**
 * Allows to merge two different snapshots of the same repository which are checked
 * in to two different SCM versions.
 *
 * @author sangupta
 */
public class MergeRepo {

	/**
	 * @param args
	 * @throws IOException 
	 */
	public static void main(String[] args) throws IOException {
		if(args.length != 3) {
			usage();
			return;
		}
		
		final String previousRepo = args[0];
		final String newerRepo = args[1];
		final String mergedRepo = args[2];
		
		final File previous =  new File(previousRepo);
		final File newer = new File(newerRepo);
		final File merged = new File(mergedRepo);
		
		if(!(previous.exists() && previous.isDirectory())) {
			System.out.println("The previous version does not exists or is not a directory.");
			return;
		}
		
		if(!(newer.exists() && newer.isDirectory())) {
			System.out.println("The newer version does not exists or is not a directory.");
			return;
		}
		
		final IOFileFilter directoryFilter = FileFilterUtils.makeCVSAware(FileFilterUtils.makeSVNAware(null));
		
		final Collection<File> olderFiles = FileUtils.listFiles(previous, TrueFileFilter.TRUE, directoryFilter);
		final Collection<File> newerFiles = FileUtils.listFiles(newer, TrueFileFilter.TRUE, directoryFilter);

		// build a list of unique paths
		System.out.println("Reading files from older version...");
		List<String> olderPaths = new ArrayList<String>();
		for(File oldFile : olderFiles) {
			olderPaths.add(getRelativePath(oldFile, previous));
		}

		System.out.println("Reading files from newer version...");
		List<String> newerPaths = new ArrayList<String>();
		for(File newerFile : newerFiles) {
			newerPaths.add(getRelativePath(newerFile, newer));
		}
		
		
		// find which files have been removed from Perforce depot
		List<String> filesRemoved = new ArrayList<String>(olderPaths);
		filesRemoved.removeAll(newerPaths);
		System.out.println("Files removed in newer version: " + filesRemoved.size());
		for(String removed : filesRemoved) {
			System.out.print("    ");
			System.out.println(removed);
		}
		
		// find which files have been added in Perforce depot
		List<String> filesAdded = new ArrayList<String>(newerPaths);
		filesAdded.removeAll(olderPaths);
		System.out.println("Files added in newer version: " + filesAdded.size());
		for(String added : filesAdded) {
			System.out.print("    ");
			System.out.println(added);
		}
		
		// find which files are common 
		// now check if they have modified or not
		newerPaths.retainAll(olderPaths);
		List<String> modified = checkModifiedFiles(newerPaths, previous, newer);
		System.out.println("Files modified in newer version: " + modified.size());
		for(String modify : modified) {
			System.out.print("    ");
			System.out.println(modify);
		}
		
		// clean any previous existence of merged repo
		System.out.println("Cleaning any previous merged repositories...");
		if(merged.exists() && merged.isDirectory()) {
			FileUtils.deleteDirectory(merged);
		}
		
		System.out.println("Merging from newer to older repository...");
		// copy the original SVN repo to merged
		FileUtils.copyDirectory(previous, merged);
		
		// now remove all files that need to be
		for(String removed : filesRemoved) {
			File toRemove = new File(merged, removed);
			toRemove.delete();
		}
		
		// now add all files that are new in perforce
		for(String added : filesAdded) {
			File toAdd = new File(newer, added);
			File destination = new File(merged, added);
			FileUtils.copyFile(toAdd, destination);
		}
		
		// now over-write modified files
		for(String changed : modified) {
			File change = new File(newer, changed);
			File destination = new File(merged, changed);
			destination.delete();
			FileUtils.copyFile(change, destination);
		}
		
		System.out.println("Done merging.");
	}
	
	private static void usage() {
		System.out.println("RepoMerge: Command-line tool to merge two snapshots of a single repositories that come from ");
		System.out.println("           different sources. Like you have your older repository in SubVersion and the newer");
		System.out.println("           code in Perforce. Now you want to merge the code and bring SVN back to the level of");
		System.out.println("           Perforce.");
		System.out.println("");
		System.out.println("Usage:    $ java com.sangupta.keepwalking.MergeRepo <previous> <newer> <destination>");
		System.out.println("");
		System.out.println("          previous      The folder corresponding to the older repository snapshot.");
		System.out.println("          newer         The folder corresponding to the newer repository snapshot.");
		System.out.println("          destination   The folder where the updated repository will be created.");
	}

	/**
	 * Checks if the file with given path is different in two different folders/branches
	 *  
	 * @param commonPath
	 * @param svn
	 * @param perforce
	 * @return
	 * @throws IOException
	 */
	private static List<String> checkModifiedFiles(List<String> commonPath, File svn, File perforce) throws IOException {
		List<String> changed = new ArrayList<String>();
		
		for(String filePath : commonPath) {
			File svnFile = new File(svn, filePath);
			File perforceFile = new File(perforce, filePath);
			
			boolean equal = FileUtils.contentEqualsIgnoreEOL(svnFile, perforceFile, Charset.defaultCharset().name());
			if(!equal) {
				changed.add(filePath);
			}
		}
		
		return changed;
	}

	/**
	 * Extract the relative path of the file from the absolute path, given the parent.
	 * 
	 * @param file
	 * @param parent
	 * @return
	 */
	private static String getRelativePath(File file, File parent) {
		String path = file.getAbsolutePath();
		String parentPath = parent.getAbsolutePath();
		if(path.startsWith(parentPath)) {
			return path.substring(parentPath.length() + 1);
		}
		
		return path;
	}

}
```

Hope it helps, some one out there!
