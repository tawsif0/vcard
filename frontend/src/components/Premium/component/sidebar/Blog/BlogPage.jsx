import React, { useState, useEffect, useContext } from "react";
import {
  FiCalendar,
  FiUser,
  FiArrowRight,
  FiFolder,
  FiSearch,
  FiClock,
  FiTag,
  FiBook,
  FiX,
  FiArrowLeft,
  FiEye,
  FiFileText,
} from "react-icons/fi";
import AuthContext from "../../../../../context/AuthContext";

const BlogPage = () => {
  const { checkAuth } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showBlogDetail, setShowBlogDetail] = useState(false);

  // Fetch blogs and categories data
  useEffect(() => {
    const fetchBlogData = async () => {
      const token = localStorage.getItem("token");

      try {
        setIsLoading(true);
        setError(null);

        // Fetch blogs - with authentication if available
        const blogsHeaders = {};
        if (token) {
          blogsHeaders["x-auth-token"] = token;
        }

        const blogsResponse = await fetch("http://localhost:5000/api/blogs", {
          headers: blogsHeaders,
        });

        if (!blogsResponse.ok) {
          // If unauthorized, try without auth (public access)
          if (blogsResponse.status === 401) {
            const publicBlogsResponse = await fetch(
              "http://localhost:5000/api/blogs"
            );
            if (publicBlogsResponse.ok) {
              const publicBlogsData = await publicBlogsResponse.json();
              const blogsArray =
                publicBlogsData.data ||
                publicBlogsData.blogs ||
                publicBlogsData ||
                [];
              setBlogs(Array.isArray(blogsArray) ? blogsArray : []);
            } else {
              throw new Error(
                `Failed to fetch blogs: ${publicBlogsResponse.status}`
              );
            }
          } else {
            throw new Error(`Failed to fetch blogs: ${blogsResponse.status}`);
          }
        } else {
          const blogsData = await blogsResponse.json();
          const blogsArray =
            blogsData.data || blogsData.blogs || blogsData || [];
          setBlogs(Array.isArray(blogsArray) ? blogsArray : []);
        }

        // Fetch categories - with authentication if available
        const categoriesHeaders = {};
        if (token) {
          categoriesHeaders["x-auth-token"] = token;
        }

        const categoriesResponse = await fetch(
          "http://localhost:5000/api/blog-categories",
          {
            headers: categoriesHeaders,
          }
        );

        if (!categoriesResponse.ok) {
          // If unauthorized, try without auth (public access)
          if (categoriesResponse.status === 401) {
            const publicCategoriesResponse = await fetch(
              "http://localhost:5000/api/blog-categories"
            );
            if (publicCategoriesResponse.ok) {
              const publicCategoriesData =
                await publicCategoriesResponse.json();
              const categoriesArray =
                publicCategoriesData.data ||
                publicCategoriesData.categories ||
                publicCategoriesData ||
                [];
              setCategories(
                Array.isArray(categoriesArray) ? categoriesArray : []
              );
            } else {
              throw new Error(
                `Failed to fetch categories: ${publicCategoriesResponse.status}`
              );
            }
          } else {
            throw new Error(
              `Failed to fetch categories: ${categoriesResponse.status}`
            );
          }
        } else {
          const categoriesData = await categoriesResponse.json();
          const categoriesArray =
            categoriesData.data ||
            categoriesData.categories ||
            categoriesData ||
            [];
          setCategories(Array.isArray(categoriesArray) ? categoriesArray : []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setBlogs([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogData();
  }, []);

  // Helper function to get category name
  const getCategoryName = (categoryValue) => {
    if (!categoryValue) return "Uncategorized";

    // If categoryValue is already a name string
    if (typeof categoryValue === "string") {
      const foundCategory = categories.find(
        (cat) =>
          cat.name === categoryValue ||
          String(cat._id) === categoryValue ||
          String(cat.id) === categoryValue
      );
      return foundCategory ? foundCategory.name : categoryValue;
    }

    // If categoryValue is an object
    if (typeof categoryValue === "object" && categoryValue !== null) {
      return categoryValue.name || "Uncategorized";
    }

    // Find category by ID
    const foundCategory = categories.find(
      (cat) =>
        String(cat._id) === String(categoryValue) ||
        String(cat.id) === String(categoryValue)
    );

    return foundCategory ? foundCategory.name : "Uncategorized";
  };

  // Count blogs per category for sidebar
  const getBlogCountByCategory = (category) => {
    return blogs.filter((blog) => {
      const blogCategoryName = getCategoryName(blog.category);
      return blogCategoryName === category.name;
    }).length;
  };

  // Filter blogs based on selected category and search term
  const filteredBlogs = blogs.filter((blog) => {
    // Category filter
    const categoryMatch =
      selectedCategory === "all" ||
      getCategoryName(blog.category) === selectedCategory;

    // Search term filter
    const searchMatch =
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryName(blog.category)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return categoryMatch && searchMatch;
  });

  // Function to strip HTML tags and get clean text
  const stripHtmlTags = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
  };

  // Parse formatted text
  const parseFormattedText = (text) => {
    if (!text) return null;

    return text.split("\n").map((line, index) => {
      if (line.trim().startsWith("•")) {
        return (
          <div key={index} className="flex items-start">
            <span className="mr-2">•</span>
            <span>{line.replace("•", "").trim()}</span>
          </div>
        );
      }

      let formattedLine = line;
      formattedLine = formattedLine.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      );
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, "<em>$1</em>");
      formattedLine = formattedLine.replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" class="text-cyan-400 underline hover:text-cyan-300 transition-colors">$1</a>'
      );

      return (
        <p
          key={index}
          className="text-gray-300 leading-relaxed text-base mb-4"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  // Open blog detail - similar to startEditing in ModifyBlog
  const openBlogDetail = (blog) => {
    setSelectedBlog(blog);
    setShowBlogDetail(true);
  };

  // Close blog detail - similar to cancelForm in ModifyBlog
  const closeBlogDetail = () => {
    setSelectedBlog(null);
    setShowBlogDetail(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <FiSearch className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Unable to Load Blog
          </h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <p className="text-gray-500 text-sm">
            Please check if the backend server is running on port 5000.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">Loading blog...</p>
        </div>
      </div>
    );
  }

  // Blog Detail View - Similar to showForm in ModifyBlog
  if (showBlogDetail && selectedBlog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Hero Section */}
        <section
          className="relative py-12 text-white overflow-hidden"
          style={{
            background: `radial-gradient(circle at center, #0f4c5c, #042a38 80%)`,
          }}
        >
          {/* Background Decorative Glow */}
          <div className="absolute inset-0 opacity-50 pointer-events-none">
            <div className="w-96 h-96 bg-cyan-500 rounded-full blur-3xl absolute -top-24 -left-24 animate-pulse"></div>
            <div className="w-96 h-96 bg-teal-600 rounded-full blur-3xl absolute bottom-16 right-16 animate-pulse delay-500"></div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-6 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Blog Details
            </h1>
          </div>
        </section>

        {/* Blog Detail Content */}
        <section className="py-8 relative z-10">
          <div className="container mx-auto px-4">
            <div className="w-full mx-auto">
              <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700/30 overflow-hidden">
                {/* Blog Header */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 border-b border-gray-700/30">
                  <h1 className="text-3xl font-bold text-white mb-4">
                    {selectedBlog.title}
                  </h1>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30">
                      <FiFolder className="w-4 h-4" />
                      {getCategoryName(selectedBlog.category)}
                    </span>
                    <span className="flex items-center gap-2 text-gray-300 px-3 py-2 rounded-xl bg-gray-800/50 border border-gray-700/30">
                      <FiCalendar className="w-4 h-4" />
                      {selectedBlog.date
                        ? new Date(selectedBlog.date).toLocaleDateString()
                        : "Recent"}
                    </span>
                    <span className="flex items-center gap-2 text-gray-300 px-3 py-2 rounded-xl bg-gray-800/50 border border-gray-700/30">
                      <FiClock className="w-4 h-4" />5 min read
                    </span>
                    {selectedBlog.author && (
                      <span className="flex items-center gap-2 text-gray-300 px-3 py-2 rounded-xl bg-gray-800/50 border border-gray-700/30">
                        <FiUser className="w-4 h-4" />
                        {selectedBlog.author}
                      </span>
                    )}
                  </div>
                </div>

                {/* Blog Image */}
                {selectedBlog.image && (
                  <div className="p-8 border-b border-gray-700/30">
                    <div className="rounded-xl overflow-hidden border border-gray-700/30 shadow-lg">
                      <img
                        src={selectedBlog.image}
                        alt={selectedBlog.title}
                        className="w-full h-96 object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Blog Content */}
                <div className="p-8">
                  <div className="prose max-w-none text-gray-300 leading-relaxed text-base">
                    {selectedBlog.content ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedBlog.content,
                        }}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700/30">
                          <FiFileText className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-400 italic">
                          No content available for this blog post.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700/30 p-6">
                  <div className="flex gap-4">
                    <button
                      onClick={closeBlogDetail}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-3 border border-cyan-500/30 shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5"
                    >
                      <FiArrowLeft className="w-5 h-5" />
                      Back to Blog List
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Main Blog List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Hero Section */}
      <section
        className="relative py-16 text-white overflow-hidden"
        style={{
          background: `radial-gradient(circle at center, #0f4c5c, #042a38 80%)`,
        }}
      >
        {/* Noise Texture Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSJ3aGl0ZSIgLz48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0iI2IwYjBiMCIgLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjMyIiByPSIyIiBmaWxsPSIjYzRjNGM0IiAvPjwvc3ZnPg==")`,
          }}
        />

        {/* Background Decorative Glow */}
        <div className="absolute inset-0 opacity-50 pointer-events-none">
          <div className="w-96 h-96 bg-cyan-500 rounded-full blur-3xl absolute -top-24 -left-24 animate-pulse"></div>
          <div className="w-96 h-96 bg-teal-600 rounded-full blur-3xl absolute bottom-16 right-16 animate-pulse delay-500"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 text-center relative z-10 flex flex-col justify-center min-h-[260px] py-4">
          {/* Animated Gradient Title */}
          <h1
            className="text-7xl sm:text-8xl font-extrabold mb-4 bg-gradient-to-r from-white via-cyan-300 to-teal-300 bg-clip-text text-transparent leading-snug"
            style={{
              backgroundSize: "200% auto",
              animation: "text-shine 4s linear infinite",
            }}
          >
            Our Blog
          </h1>

          {/* Divider */}
          <div className="w-24 h-1 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 shadow-lg"></div>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-cyan-100 max-w-3xl mx-auto leading-relaxed opacity-90 mb-6">
            Insights, stories, and updates from our journey
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300 w-5 h-5" />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-cyan-400/30 text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
            />
          </div>
        </div>

        <style>{`
          @keyframes text-shine {
            0%, 100% {
              background-position: 200% center;
            }
            50% {
              background-position: -200% center;
            }
          }
          @keyframes pulse {
            0%, 100% {
              opacity: 0.4;
            }
            50% {
              opacity: 0.8;
            }
          }
          .animate-pulse {
            animation: pulse 8s ease-in-out infinite;
          }
        `}</style>
      </section>

      {/* Main Content */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Categories */}
            <div className="lg:w-1/4">
              <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-lg p-6 sticky top-8 border border-gray-700/30">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FiFolder className="w-5 h-5 text-cyan-400" />
                  Categories
                </h3>

                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between ${
                      selectedCategory === "all"
                        ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/30"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-white border border-transparent"
                    }`}
                  >
                    <span>All Posts</span>
                    <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-sm">
                      {blogs.length}
                    </span>
                  </button>

                  {categories.map((category) => {
                    const blogCount = getBlogCountByCategory(category);
                    if (blogCount === 0) return null;

                    return (
                      <button
                        key={category._id || category.id}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between ${
                          selectedCategory === category.name
                            ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/30"
                            : "text-gray-400 hover:bg-gray-800/50 hover:text-white border border-transparent"
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-sm">
                          {blogCount}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Recent Posts */}
                <div className="mt-8 pt-6 border-t border-gray-700/30">
                  <h4 className="font-semibold text-white mb-4">
                    Recent Posts
                  </h4>
                  <div className="space-y-3">
                    {blogs.slice(0, 3).map((blog) => (
                      <div
                        key={blog._id || blog.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer border border-transparent hover:border-cyan-500/20"
                        onClick={() => openBlogDetail(blog)}
                      >
                        {blog.image && (
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {blog.title}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            {blog.date
                              ? new Date(blog.date).toLocaleDateString()
                              : "Recent"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Blog Content */}
            <div className="lg:w-3/4">
              {/* Category Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {selectedCategory === "all"
                    ? "All Blog Posts"
                    : selectedCategory}
                </h2>
                <p className="text-gray-400">
                  {filteredBlogs.length} post
                  {filteredBlogs.length !== 1 ? "s" : ""} found
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
              </div>

              {/* Blog Posts Grid */}
              <div className="space-y-6">
                {filteredBlogs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredBlogs.map((blog) => (
                      <article
                        key={blog._id || blog.id}
                        className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 group cursor-pointer border border-gray-700/30 hover:border-cyan-500/30 transform hover:-translate-y-1"
                        onClick={() => openBlogDetail(blog)}
                      >
                        {/* Blog Image */}
                        {blog.image && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={blog.image}
                              alt={blog.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        )}

                        {/* Blog Content */}
                        <div className="p-6">
                          {/* Category Badge */}
                          <div className="mb-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-600/20 text-cyan-300 border border-cyan-500/30">
                              <FiFolder className="w-3 h-3 mr-1" />
                              {getCategoryName(blog.category)}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors line-clamp-2">
                            {blog.title || "Untitled Post"}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                            {blog.content
                              ? stripHtmlTags(blog.content).substring(0, 120) +
                                "..."
                              : "No content available..."}
                          </p>

                          {/* Meta Information */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <FiCalendar className="w-3 h-3" />
                                {blog.date
                                  ? new Date(blog.date).toLocaleDateString()
                                  : "Recent"}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiClock className="w-3 h-3" />5 min
                              </span>
                            </div>

                            <button className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium group-hover:gap-2 transition-all text-sm">
                              Read
                              <FiArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  /* No Posts Found */
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700/30">
                      <FiSearch className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      No blog posts found
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm
                        ? `No posts matching "${searchTerm}"`
                        : `No posts in ${selectedCategory} category`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
