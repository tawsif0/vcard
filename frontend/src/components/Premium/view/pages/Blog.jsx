import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const postsPerPage = 2;
  const totalPages = 3;

  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "Personalized Learning System using AI",
      category: "Web Design",
      date: "Feb 18",
      comments: 32,
      files: 18,
      description: "Data scans have done in repertoosions in voluptate with ease of film choice or flight in most not ever-cession-talented blends and set simple or ex-demirable contrapas. Data access levels older in repertoosions in voluptates blers, such as cold spots moist as rain.",
      image: "768X436",
      fullContent: `
        Data scans have done in repertoosions in voluptate with ease of film choice or flight in most not ever-cession-talented blends and set simple or ex-demirable contrapas. Data access levels older in repertoosions in voluptates blers, such as cold spots moist as rain.

        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est labo rum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudan tium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam elus modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
      `,
      highlightedContent: "Duis aute irure dolor in reprehenderit in fugiat voluptate commodo velit esse cillum dolore eu fugiat nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor involuptate velit esse reprehenderit in volup onsectetur.",
      projectInfo: {
        category: "Web Design",
        client: "Who Design",
        projectType: "Contingent",
        platform: "What App"
      }
    },
    {
      id: 2,
      title: "Real-Time Language Translation using AI",
      category: "Web Design",
      date: "Feb 18",
      comments: 32,
      files: 18,
      description: "Data scans have done in repertoosions in voluptate with ease of film choice or flight in most not ever-cession-talented blends and set simple or ex-demirable contrapas. Data access levels older in repertoosions in voluptates blers, such as cold spots moist as rain.",
      image: "768X436",
      fullContent: "Full content for post 2...",
      highlightedContent: "Highlighted content for post 2...",
      projectInfo: {
        category: "AI Development",
        client: "Tech Solutions",
        projectType: "Complex",
        platform: "Mobile App"
      }
    }
  ];

  // Recent posts data
  const recentPosts = [
    {
      id: 1,
      title: "When the smiles ever turn off the light",
      date: "May 23, 2020",
      image: "72X72"
    },
    {
      id: 2,
      title: "The man who is happy will make you too",
      date: "May 23, 2020",
      image: "72X72"
    },
    {
      id: 3,
      title: "People are strange when you are",
      date: "May 23, 2020",
      image: "72X72"
    }
  ];

  // Categories data
  const categories = [
    { name: "AI Research", count: 54 },
    { name: "AI Bot development", count: 33 },
    { name: "Image generation", count: 70 },
    { name: "Video generation", count: 99 },
    { name: "Content Creation", count: 44 },
    { name: "Web Development", count: 21 },
    { name: "Digital Marketing", count: 50 }
  ];

  // Tags data
  const tags = [
    "Amazon", "Instagram", "Twitter", "ChatGPT", "Midjourney", "Share", "Games"
  ];

  // Comments data
  const comments = [
    {
      id: 1,
      name: "Justin Trabelek",
      date: "Feb 18, 2023 10:33 am",
      avatar: "90X90",
      comment: "Kablisi turmi sapino charihi huye khador nio na, kablisi turmi ei rithia chor amay vehona incidunt ut labo late with esse cilium dolore eu ligtat nulla pariatur. Excepteur sint occ are est cuplidata non proident, saut in culpa qui officia"
    },
    {
      id: 2,
      name: "Leyis Antler",
      date: "Feb 18, 2023 10:33 am",
      avatar: "90X90",
      comment: "Kablisi turmi sapino charihi huye khador nio na, kablisi turmi ei rithia chor amay vehona incidunt ut labo late with esse cilium dolore eu ligtat nulla pariatur. Excepteur sint occ are est cuplidata non proident, saut in culpa qui officia"
    },
    {
      id: 3,
      name: "James Anderson",
      date: "Feb 18, 2023 10:33 am",
      avatar: "90X90",
      comment: "Kablisi turmi sapino charihi huye khador nio na, kablisi turmi ei rithia chor amay vehona incidunt ut labo late with esse cilium dolore eu ligtat nulla pariatur. Excepteur sint occ are est cuplidata non proident, saut in culpa qui officia"
    },
    {
      id: 4,
      name: "Paul Walker",
      date: "Feb 18, 2023 10:33 am",
      avatar: "90X90",
      comment: "Kablisi turmi sapino charihi huye khador nio na, kablisi turmi ei rithia chor amay vehona incidunt ut labo late with esse cilium dolore eu ligtat nulla pariatur. Excepteur sint occ are est cuplidata non proident, saut in culpa qui officia"
    }
  ];

  // Calculate current posts to display
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // Modal handlers
  const openModal = (post) => {
    setSelectedPost(post);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedPost(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-8">
      {/* Blog Section */}
      <section id="blog" className="mt-16">
        <div className="container mx-auto px-4">
          {/* Navigation Component */}
          <div className="relative mb-16">
            <Navigation />
          </div>
          
          {/* Main White Card Container */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Title Section */}
            <div className="pb-6 mb-8 border-b border-gray-300">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <h2 className="text-3xl font-bold relative pl-6 before:content-[''] before:absolute before:left-0 before:top-1/2 before:transform before:-translate-y-1/2 before:w-1 before:h-8 before:bg-indigo-600">
                  Blog with Sidebar
                </h2>
                <p className="text-gray-600 max-w-xl text-left">
                  Eva cididunt ut labore et dolor magna antiqua.Ut ad enum ad dolor sit amet consectetur adipisicing elit.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - 2/3 width */}
              <div className="lg:col-span-2">
                {/* Blog Posts */}
                <div className="space-y-8">
                  {currentPosts.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-300 rounded-lg p-6">
                      {/* Featured Image */}
                      <div className="bg-gray-300 h-64 flex items-center justify-center rounded-lg mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-700">{post.image}</div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="px-2">
                        {/* Title */}
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          {post.title}
                        </h3>

                        {/* Meta Information */}
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-gray-700 font-medium">{post.category}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-500">No.{post.files}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-500">{post.comments}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                          {post.description}
                        </p>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-300">
                          <button 
                            onClick={() => openModal(post)}
                            className="text-green-500 font-semibold text-sm hover:text-green-600 transition-colors"
                          >
                            Read More
                          </button>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700 font-semibold text-sm">Show:</span>
                            <div className="flex gap-1">
                              <button className="w-6 h-6 bg-gray-800 text-white rounded text-xs flex items-center justify-center hover:bg-gray-900 transition-colors">
                                In
                              </button>
                              <button className="w-6 h-6 bg-gray-800 text-white rounded text-xs flex items-center justify-center hover:bg-gray-900 transition-colors">
                                &lt;
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-gray-300">
                  {/* Previous Button */}
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border ${
                      currentPage === 1 
                        ? "border-gray-300 text-gray-400 cursor-not-allowed" 
                        : "border-gray-400 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    ←
                  </button>

                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border font-medium ${
                          currentPage === page
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border ${
                      currentPage === totalPages 
                        ? "border-gray-300 text-gray-400 cursor-not-allowed" 
                        : "border-gray-400 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Sidebar - 1/3 width */}
              <div className="lg:col-span-1">
                <div className="space-y-8">
                  {/* Recent Posts Section */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 relative pl-4 before:content-[''] before:absolute before:left-0 before:top-1/2 before:transform before:-translate-y-1/2 before:w-1 before:h-6 before:bg-indigo-600">
                      Recent Posts 
                    </h3>
                    
                    <div className="space-y-4">
                      {recentPosts.map((post) => (
                        <div key={post.id} className="flex gap-4 group cursor-pointer pb-4 last:pb-0 border-b border-gray-200 last:border-b-0">
                          {/* Thumbnail Image */}
                          <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-gray-700">72X72</span>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-green-500 transition-colors leading-tight mb-1 text-sm">
                              {post.title}
                            </h4>
                            <p className="text-gray-500 text-xs">{post.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Categories Section */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 relative pl-4 before:content-[''] before:absolute before:left-0 before:top-1/2 before:transform before:-translate-y-1/2 before:w-1 before:h-6 before:bg-indigo-600">
                      Categories 
                    </h3>
                    
                    <div className="space-y-3">
                      {categories.map((category, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                          <span className="text-gray-700 hover:text-green-500 transition-colors cursor-pointer text-sm">
                            {category.name}
                          </span>
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                            {category.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags Section */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 relative pl-4 before:content-[''] before:absolute before:left-0 before:top-1/2 before:transform before:-translate-y-1/2 before:w-1 before:h-6 before:bg-indigo-600">
                      Tags 
                    </h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium hover:bg-green-500 hover:text-white transition-colors cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Modal with Transparent Background */}
      {selectedPost && (
        <div className="fixed inset-0 bg-transparent z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto" onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-6xl w-full my-8 shadow-2xl transform transition-all duration-300 border border-gray-300" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <div className="flex justify-end p-6 pb-0">
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-green-500 transition-all duration-200 p-3 rounded-2xl hover:bg-green-50 transform hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Content */}
            <div className="px-8 pb-8">
              {/* First Portion - Blog Content */}
              <div className="mb-12">
                {/* Featured Image */}
                <div className="bg-gray-300 h-96 flex items-center justify-center rounded-xl mb-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-700 mb-4">768X436</div>
                    <div className="text-2xl font-semibold text-gray-800">{selectedPost.title}</div>
                  </div>
                </div>

                {/* Title and Meta */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {selectedPost.title}
                  </h2>
                  <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
                    <span>{selectedPost.category}</span>
                    <span>•</span>
                    <span>{selectedPost.date}</span>
                    <span>•</span>
                    <span>{selectedPost.comments}</span>
                  </div>
                </div>

                {/* Full Content */}
                <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
                  {selectedPost.fullContent.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-lg">
                      {paragraph}
                    </p>
                  ))}
                  
                  {/* Highlighted Content */}
                  <div className="bg-gray-100 p-6 rounded-lg border-l-4 border-green-500 my-8">
                    <p className="text-lg italic text-gray-800">
                      {selectedPost.highlightedContent}
                    </p>
                  </div>
                </div>
              </div>

              {/* Second Portion - Comments Section */}
              <div className="bg-gray-50 rounded-xl border border-gray-300 p-8">
                {/* Project Info and Share */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  {/* Project Information */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Project Information</h3>
                    <div className="space-y-4">
                      {Object.entries(selectedPost.projectInfo).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="font-semibold text-gray-700 capitalize">{key}:</span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Share Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">Share:</span>
                        <div className="flex space-x-3">
                          <button className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all duration-300 transform hover:scale-110">
                            <span className="text-sm font-bold">In</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Related Posts */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h3>
                    <div className="space-y-4">
                      {recentPosts.slice(0, 2).map((post) => (
                        <div key={post.id} className="flex gap-4 group cursor-pointer">
                          <div className="w-20 h-20 bg-gray-300 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-gray-700">96X96</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-green-500 transition-colors mb-1">
                              {post.title}
                            </h4>
                            <p className="text-gray-500 text-sm">How Does I</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">{comments.length} Comments Found</h3>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-6 mb-12">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-gray-700">90X90</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h4 className="font-semibold text-gray-900">{comment.name}</h4>
                            <span className="text-gray-500 text-sm">{comment.date}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {comment.comment}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment Form */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Add A Comment</h3>
                    <div className="space-y-6">
                      <textarea
                        placeholder="Write your message here"
                        rows="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          placeholder="Your Name"
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="email"
                          placeholder="Your Email"
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Your website"
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <button className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                        Submit Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;