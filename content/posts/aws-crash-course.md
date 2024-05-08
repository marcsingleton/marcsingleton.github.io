+++
author = "Marc Singleton"
title = "A Crash Course in AWS (draft)"
date = "2024-05-01"
summary = "An overview of concepts in cloud computing and their relation to AWS"
tags = ["aws", "hpc", "cloud-computing", "crash-course", "explanation"]
showTableOfContents = true
+++

## Introduction: Data science in the cloud
In an age of big data, it's increasingly convenient and even necessary to do data science in the cloud, *i.e.*, using on-demand computing resources that are effectively rented from a provider rather than building and maintaining private computing infrastructure. There are two main reasons that the cloud has exploded in popularity over the past fifteen years. The first of these is maintenance. This includes the raw capital needed to both build and upkeep computing infrastructure, but also more abstract considerations like availability and security. Like any utility, computing becomes cheaper at scale, but that scale is beyond the scope of all but the largest and most resourced companies. As a result, for startups and smaller companies, it's simply more efficient to rent their computing resources from a provider rather than invest in their own. The second reason is flexibility, or the ability to easily scale resources up and down to match the current needs. From a web development perspective, this is often framed as provisioning resources for a server to the match the current demand for a website or service. However, elasticity also applies to a data science context where storage and compute needs may suddenly spike due to the acquisition of a TB-sized data set or the one-off training of a large language model.

There are a variety of cloud services from the expected players (Amazon, Google, Microsoft) including some more boutique providers that repackage those services in other forms for specific applications, like Netlify and (formerly) Dropbox. However, Amazon's cloud computing service, AWS, is one of the oldest and largest, and accordingly has a vast array of products that cover a variety of use cases, depending on the desired level of control over configuration. I'm not a web developer or data engineer, so I'm by no means an expert on any of these services and the trade-offs between them. I instead come from computational biology and bioinformatics, so my point of view is influenced by high-performance computing. [Cloud](https://cloud.google.com/learn/what-is-cloud-computing) and [high-performance](https://cloud.google.com/discover/what-is-high-performance-computing) computing overlap significantly since the latter generally involves requesting and configuring computing resources over a network. However, HPC more specifically refers to computationally intensive applications where the work is distributed over clusters of individual computing units called nodes.

As a result, I tend to approach topics in computing from a bottom-up perspective, and in this post I'll explain what I see as the building blocks of AWS that many of its other services are built on. This is an [explanation rather than a tutorial or how-to guide](https://docs.divio.com/documentation-system/), so I won't walk through the specific steps for setting up an account on AWS and getting an instance up and running with your favorite data science environment. Instead I'll focus on how big picture concepts in cloud computing relate to the specific services offered by AWS. Along the way I'll also link to some user and how-to guides that show in detail how these resources are configured. As a final note, I should mention that I'm not affiliated with Amazon in any way and that my choice of AWS as the topic of this post is mostly a reflection of its popularity rather than a endorsement over its competitors.

## The three resource cards
Computing resources in cloud can broadly be divided into three categories: compute, storage, and network. However, to make this model more concrete for our data science perspective, we can frame these resources in terms of how they interact with data:

- Compute: manipulating data
- Storage: storing data
- Network: transferring data

Amazon offers different services for different needs in each of these categories, and for the most part, they can be mixed and matched, which gives a high (if at first overwhelming) amount of flexibility. In the next sections, I'll cover the highlights and relationships between each in more detail with an emphasis on applications in data science.

### Compute
The basic compute unit in AWS is an EC2 instance. EC2 stands for Elastic Cloud Compute and refers to the ability to provision compute resources called instances on demand. Each instance has a specified hardware and computing environment where the environment includes the operating system and any pre-installed software. You can think of provisioning an EC2 instance as effectively renting a laptop with a clean install of the desired computing environment. In practice, these instances are often virtual machines running on a more powerful system, but for our purposes we can think of them as independent computational units. The computing environments are built from templates called images, and Amazon has a library of images for launching instances, though there are also options for buying them from a marketplace or creating your own. These images are one method to avoid the time-consuming and error-prone installation and configuration of standard packages every time an instance is launched. An alternative solution is using containerization software like Docker or Singularity, which is less prone to vendor lock-in.

Many other services are built over EC2 that abstract or automate the details of managing nodes. For example, Lambda is a "serverless" compute service that can execute code on demand in response to events. For example, a Lambda function can automatically run on each file uploaded to a data storage bucket to perform some computation. Of course behind the scenes, a server is spinning up the compute instance and running the code, but these details are hidden from the users. A similar service is ECS (Elastic Container Service), which automates the creation and configuration of containers. Lambda currently has an execution time limit of 15 minutes, so ECS is intended for more intensive and long-running compute needs. One use case is the deployment of machine learning models where every user of a photo storage service needs a unique model for recognizing the specific faces in their library. Since it's not possible to manually request instances and manage their computing environments for millions of users, ECS offers an interface for managing containers at scale.

### Storage
- Many storage options depending on availability, persistence, and performance
- S3 (Simple Storage Solution)
	- Stores objects in buckets which are flat containers for data
	- Objects have maximum size of 5 TB, and buckets have no total size or object limits
	- Objects are available through web interfaces, e.g. https
	- Appears intended for archiving large amounts of unstructured data for databases or long-term storage
		- Has interfaces for querying data in place like Athena
- EBS (Elastic Block Storage)
	- Hierarchical file system storage for a single EC2 instance, offering the lowest-latency access to data
- EFS (Elastic File System)
 	- Hierarchical file system that can connect to thousands of EC2 instances, acting as a shared file system
	- Files are automatically moved into different priced-tiered storage classes based on access patterns
	- EFS is closest to a shared drive where teams can directly access and manipulate common resources
  	- Likely best option for collaborative analysis of large data sets to prevent transfer time and charges
  	- Does require some additional configuration to mount these file systems as network drives

### Network
 - Everything in AWS is done over the internet (that's the cloud in computing computing), so it's impossible to use without understanding some basic networking terminology
- IP addresses
  - IPv4 vs IPv6
- Regions and availability zones
- VPCs and security groups
  - Biggest gotcha is setting permissions and security groups
