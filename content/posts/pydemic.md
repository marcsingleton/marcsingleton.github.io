+++
author = "Marc Singleton"
title = "Pydemic: A text-based implementation of the board game Pandemic"
date = "2024-12-01"
summary = "Lessons learned from coding an interactive program on the command line."
tags = ["python", "object-oriented-programming", "design-patterns"]
+++

## Introduction
I recently wrapped up work on a text-based implementation of the board game Pandemic. The origin story of this project is back in 2018 during my early days of learning Python, I was curious about object-oriented programming. Games are a great fit for object-oriented patterns since they often have complex and interacting behaviors that are represented by literal objects. I had recently bought the game and was familiar with its rules, so I naturally chose it for this project. I ultimately managed to get a mostly working and mostly complete version up and running before running out of steam and taking a break.

Years later, I came across it again while re-organizing my coding projects and thought it was a shame I left it almost finished. I expected it would be only week or two in my spare time to tie up the remaining loose ends, but I ended up playing a good joke on myself because it ended up taking several. Some of this time was undoubtedly spent chasing perfection, but the main reason it took so long is it turns out game development (even for a simple text-based one) is very complex! I'm sure this is no surprise to anyone who's worked on similar projects, but it honestly caught me off guard. Unlike the data pipelines I usually work on that handle and transform data in a small number of prescribed formats, this program had to harmonize many interlocking systems that may attempt to put the game into an invalid state during normal operation. It was a different style of programming than I'm used to, and since I learned a lot about creating robust and extensible programs, I wanted to briefly reflect on some lessons learned--both for myself and anyone else who might embark on a similar project in the future.

I've grouped my lessons into two broad categories. The first is a short but sweet plea for incorporating testing early and often in development, and the second is a series of observations about good practices for API design.

## Test early and often

## Good practices for API design