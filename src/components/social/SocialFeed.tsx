import React from 'react';
import { Heart, MessageCircle, Share2, Sparkles, Send, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { UserProfile, SocialPost } from '../../types';

interface SocialFeedProps {
  currentUser: UserProfile;
  posts: SocialPost[];
  newPostContent: string;
  setNewPostContent: (val: string) => void;
  newPostImage: string;
  setNewPostImage: (val: string) => void;
  isPublishing: boolean;
  postAiNotice: string | null;
  handleCreatePost: (e: React.FormEvent) => void;
  handleLikePost: (postId: string) => void;
  commentInputs: { [postId: string]: string };
  setCommentInputs: React.Dispatch<React.SetStateAction<{ [postId: string]: string }>>;
  postComments: { [postId: string]: { id: string; author: UserProfile; content: string; created_at: string }[] };
  handleAddComment: (postId: string) => void;
  onReportPost: (post: SocialPost) => void;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({
  currentUser,
  posts,
  newPostContent,
  setNewPostContent,
  newPostImage,
  setNewPostImage,
  isPublishing,
  postAiNotice,
  handleCreatePost,
  handleLikePost,
  commentInputs,
  setCommentInputs,
  postComments,
  handleAddComment,
  onReportPost
}) => {
  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      <div className="bg-white border border-[#d3c4af]/60 rounded-xl p-5 shadow-xs">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="flex gap-3 items-start">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border border-[#785600]/30 shrink-0"
            />
            <div className="flex-1 space-y-2">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Partilhe uma reflexão, intenção de oração ou trecho bíblico..."
                rows={3}
                className="w-full p-3 bg-[#fcf9f8] border border-[#d3c4af]/60 rounded-lg text-xs font-sans text-[#1c1b1b] placeholder:text-[#817563] focus:border-[#785600] focus:ring-0 resize-none"
              />
              <input
                type="url"
                value={newPostImage}
                onChange={(e) => setNewPostImage(e.target.value)}
                placeholder="URL de imagem opcional (ex: https://...)"
                className="w-full px-3 py-1.5 bg-[#fcf9f8] border border-[#d3c4af]/40 rounded text-xs font-sans text-[#1c1b1b] placeholder:text-[#817563] focus:border-[#785600]"
              />
            </div>
          </div>

          {postAiNotice && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{postAiNotice}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#d3c4af]/30">
            <div className="flex items-center gap-2 text-[11px] text-[#817563]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1c5d3a]" />
              <span>Moderação síncrona ativa</span>
            </div>
            <button
              type="submit"
              disabled={isPublishing || !newPostContent.trim()}
              className="px-4 py-2 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isPublishing ? 'Analisando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>

      {/* Feed Posts List */}
      <div className="space-y-6">
        {posts.map((post) => {
          const comments = postComments[post.id] || [];
          return (
            <article
              key={post.id}
              className="bg-white border border-[#d3c4af]/60 rounded-xl p-5 shadow-2xs space-y-4"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#d3c4af]/40"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-semibold text-sm text-[#1c1b1b]">
                        {post.author.name}
                      </span>
                      {post.author.is_verified_parish && (
                        <span className="px-1.5 py-0.5 bg-[#785600]/10 text-[#785600] text-[9px] font-bold uppercase rounded">
                          Paróquia
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#817563] font-sans">
                      {post.author.handle} • {post.created_at}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onReportPost(post)}
                  className="text-xs text-[#817563] hover:text-[#9a3e3c] transition-colors"
                  title="Denunciar publicação"
                >
                  Denunciar
                </button>
              </div>

              {/* Post Content */}
              <p className="font-sans text-xs text-[#1c1b1b] leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              {post.image_url && (
                <div className="rounded-lg overflow-hidden border border-[#d3c4af]/40 aspect-video">
                  <img src={post.image_url} alt="Mídia da postagem" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Actions Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-[#d3c4af]/30 text-xs text-[#817563]">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center gap-1.5 transition-colors font-medium ${
                    post.user_liked ? 'text-[#9a3e3c]' : 'hover:text-[#9a3e3c]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.user_liked ? 'fill-[#9a3e3c]' : ''}`} />
                  <span>{post.likes_count}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" />
                  <span>{comments.length} comentários</span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="pt-3 border-t border-[#d3c4af]/20 space-y-3 bg-[#fcf9f8] p-3 rounded-lg">
                {comments.map((comm) => (
                  <div key={comm.id} className="flex items-start gap-2.5 text-xs">
                    <img
                      src={comm.author.avatar}
                      alt={comm.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#d3c4af]/30 shrink-0"
                    />
                    <div className="flex-1 bg-white p-2.5 rounded-lg border border-[#d3c4af]/30 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#1c1b1b]">{comm.author.name}</span>
                        <span className="text-[10px] text-[#817563]">{comm.created_at}</span>
                      </div>
                      <p className="text-[#4f4535]">{comm.content}</p>
                    </div>
                  </div>
                ))}

                {/* Add Comment Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    placeholder="Escreva um comentário edificante..."
                    className="flex-1 px-3 py-1.5 bg-white border border-[#d3c4af]/60 rounded-lg text-xs font-sans text-[#1c1b1b] placeholder:text-[#817563] focus:border-[#785600]"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="px-3 py-1.5 bg-[#1c1b1b] text-white text-xs font-bold rounded-lg hover:bg-[#785600] transition-colors"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
