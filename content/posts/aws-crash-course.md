+++
author = "Marc Singleton"
title = "A Crash Course in AWS"
tags = ["aws", "hpc", "cloud-computing", "crash-course", "explanation"]
draft = true
+++

## Introduction: Data science in the cloud
- In an age of big data, it's increasingly convenient and even necessary to do data science in the cloud
  - Using on-demand computing resources that are effectively rented from a provider rather than building and maintaining one's own computing infrastructure
- Two main reasons
  - The first is maintenance
    - Encompasses the resources to build and upkeep computing infrastructure
    - Also includes more abstract consideration like availability and security
  - The second is flexibility, the ability to easily scale resources (and costs) up and down to match the current needs
    - Storage: Pay for exactly what is used
    - Compute: Access high performance hardware only when needed
  - Like any utility, computing becomes cheaper at scale, but that scale beyond the scope of all but the largest and most resourced companies
- Many services from the expected players (Amazon, Microsoft, Google) including some more boutique providers that repackage those services in other forms for specific applications
- Amazon's cloud computing service, AWS, is one of the oldest and largest, and accordingly has a vast array of products that cover a variety of use cases
  - Some example use cases
- I'm not a web developer or data engineer, so by no means an expert on any of these topics
- I instead come from computational biology and bioinformatics, so my point of view is influenced by high-performance computing
  - [Cloud](https://cloud.google.com/learn/what-is-cloud-computing) and [high-performance](https://cloud.google.com/discover/what-is-high-performance-computing) computing overlap significantly since the latter generally involves requesting and configuring computing resources over a network. However, HPC more specifically refers to computationally intensive applications where the work is distributed over clusters of individual computing units called nodes
- In this post, I explain what I see as the building blocks of AWS that many of its other services are built on
  - This is an [explanation rather than a tutorial or how-to guide](https://docs.divio.com/documentation-system/)
  - I won't walk through the specific steps for setting up an account on AWS and getting an instance up and running with your favorite data science environment
  - Instead I'll focus on how big picture concepts in cloud computing relate to the specific services offered by AWS
    - Along the way also link to some user and how-to guides that show in detail how these resources are configured

## The three resource cards
- Computing resources can broadly be divided into storage and compute.
  - Storage is ...
  - Compute is ...
  - Network is ...

### Storage
- See notes

### Compute
- EC2 is basic computation unit
- Think of it has checking out a laptop with a clean install of your chosen computing environment (MacOS, Linux)
  - Called images
- Can be clean install or come pre-packaged with your favorite software
  - Cost differences?
- Other services built over EC2

### Network
 - Everything in AWS is done over the internet (that's the cloud in computing computing), so it's impossible to use without understanding some basic networking terminology
- IP addresses
  - IPv4 vs IPv6
- Regions and availability zones
- VPCs and security groups
  - Biggest gotcha is setting permissions and security groups
