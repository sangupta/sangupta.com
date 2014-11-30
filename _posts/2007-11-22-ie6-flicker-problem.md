---
layout: default
title: IE6 Flicker Problem
permalink: /2007/11/ie6-flicker-problem.html
redirect_from: "/2007/11/ie6-flicker-problem.html"
date: Thu Nov 22 14:45:00 IST 2007
sharingURL: http://blog.sangupta.com/2007/11/ie6-flicker-problem.html
tags: coding-techniques web
---
Yesterday, I was upgrading the 
<a href="http://foliage-in-xml.blogspot.com" title="Modified Foliage Theme for Blogger.">Modified Foliage Theme for Blogger</a>. I had been testing it out in Firefox 2.0 and IE 7.0 for long. This time it was IE 6.0 that I was testing the theme on. The theme almost behaved in the manner expected, except a few DIV issues. After fixing them, my attention diverted to a flicker that was caused in the pull button.
<br>
<br>As soon as I hovered over the pull button, there was a flicker over the string drop animation. When I de-hovered, there was a flicker again. It was occurring again and again. The browsers are supposed to cache to all images, and hence, my first assumption was it to be just another CSS issue. I tried aligning the images using absolute position, then trying it with a table, but the flicker didn't go. The last option as usual is GOOGLE.
<br>
<br>A quick search over the Google made me realize that the problem is inherent in IE 6.0 It's not an issue with the HTML code, but with the way IE6 handles background images defined in CSS. 
<br>
<br>The solutions to the problem are defined on this 
<a href="http://www.fivesevensix.com/studies/ie6flicker/">page</a> and this 
<a href="http://dean.edwards.name/my/flicker.html">page</a>. The following is mostly a rewrite of what has been written elsewhere.
<br>
<br>The problem:
<br>
<ul>
    <li>A flicker is visible with background images defined in a CSS, when the explorer's cache settings are set to "Check for newer version with every visit to the page."</li>
    <li>Is caused only in Internet Explorer 6.0, and not in previous or later versions.</li>
    <li>There is no patch for IE 6.0 which rectifies this problem.</li> 
    <li>There is no client side fool-proof solution to it.</li>
    <li>It can be resolved by server-side configuration, or by using Javascript (which again could be blocked by a user).</li> 
</ul>Solutions Available:
<br>
<ul>
    <li>A solution using Apache Server is available <a href="http://dean.edwards.name/my/flicker.html">here</a>.</li>
    <li>A solution using javascript is as under (<a href="http://www.mister-pixel.com/#Content__state=is_that_simple">source</a>),<pre class="brush: js">try {<br>document.execCommand("BackgroundImageCache", false, true);<br>} catch(err) {<br>}</pre>Just add the above javascript code to the page load event.<br></li>
    <li>A solution for IIS server is explained <a href="http://www.aspnetresources.com/blog/cache_control_extensions.aspx">here</a>.</li>
    <li>A solution for ASP.NET server is explained <a href="http://www.groovybits.com/leftoverbits/flickerfix.aspx">here</a>.</li>
</ul>Hope this helps.
