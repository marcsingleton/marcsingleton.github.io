+++
author = "Marc Singleton"
title = "An AWS Crash Course"
draft = true
+++

Main topic: introduction to basic concepts for data science computing in the cloud with AWS

AWS is a vast topic. As one of the oldest and largest cloud providers, has a dizzying array of products that cover a variety of use cases
Not a web developer or data engineer, so by no means an expert on any of these topics
Coming from academic data science (specifically computational biology and bioinformatics), so my point of view is influenced by high performance computing rather than cloud computing.
Nowadays the two terms overlap significantly (most HPC is in the cloud), but HPC is generally much "closer to the metal" in the sense that you have to manually request and configure computing resources.
I'll focus on what I see as the building blocks of AWS that many of its other services are built on.
I'll also try to explain basic networking concepts as needed.

# Storage and compute
Computing resources can broadly be divided into storage and compute.
Storage is ...
Compute is ...

## Compute options
EC2 is basic computation unit
Think of it has checking out a laptop with a clean install of your chosen computing environment (MacOS, Linux)
    Called images
Can be barebones or come pre-packaged with your favorite software
    Costs differences?
Other services built over EC2

## Storage options
See notes

## Networking
Everything in AWS is done over the internet (that's the cloud in computing computing), so it's impossible to use without understanding some basic networking terminology
IP addresses
    IPv4 vs IPv6
Regions and availability zones

VPCs and security groups
    Biggest gotcha is setting permissions and security groups