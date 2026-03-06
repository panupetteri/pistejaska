import React, { FC, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { orderBy } from "lodash-es";
import { useNotifications } from "./common/hooks/useNotifications";
import { useUsers } from "./common/hooks/useUsers";
import { useGames } from "./common/hooks/useGames";
import ButtonPrimary from "./common/components/buttons/ButtonPrimary";
import List from "./common/components/lists/List";
import ListItem from "./common/components/lists/ListItem";
import ListItemText from "./common/components/lists/ListItemText";
import ListItemIcon from "./common/components/lists/ListItemIcon";
import { IconPerson } from "./common/components/icons/IconPerson";

// Optional: A small helper to format dates more human-readably if you prefer 
// not to use a library like date-fns. You can swap this with your date utility!
const formatRelativeDate = (dateString: string | number | Date) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString); // Fallback
  
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isYesterday = yesterday.toDateString() === date.toDateString();
  
  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const NotificationsModal: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, loading, dismissNotification, dismissAll } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [hasAutoShown, setHasAutoShown] = useState(false);
  const [users] = useUsers();
  const [games] = useGames();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 1. Auto-show on first load if there are unread notifications
  useEffect(() => {
    if (!loading && unreadCount > 0 && !hasAutoShown) {
      setIsVisible(true);
      setHasAutoShown(true);
    }
  }, [loading, unreadCount, hasAutoShown]);

  // 2. Re-show modal if user clicks the NavBar link
  useEffect(() => {
    if (location.state?.showNotifications) {
      setIsVisible(true);
      // Clear the state so it doesn't pop up again on unrelated re-renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.showNotifications, navigate, location.pathname]);

  if (notifications.length === 0 || !isVisible) {
    return null;
  }

  const sortedNotifications = orderBy(
    notifications,
    (n) => n.created.epochMilliseconds,
    "desc",
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* HEADER: Simplified, removed redundant subtitle, moved 'Mark all read' here */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
            {/* Scaled down header from a massive Heading1 to standard bold text */}
              <h2 className="text-xl font-bold text-slate-900 m-0">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {unreadCount} NEW
                </span>
              )}
            </div>
          {unreadCount > 0 && (
            <button 
              onClick={dismissAll}
              className="text-sm text-purple-600 font-medium hover:text-purple-800 transition-colors px-2 py-1 rounded hover:bg-purple-50"
            >
              Mark all read
            </button>
          )}
        </div>
        
        {/* NOTIFICATIONS LIST */}
        <div className="overflow-y-auto flex-1 p-2">
          <List>
            {sortedNotifications.map((n) => {
              const fromUser = users.find(u => u.id === n.fromUserId);
              const game = games.find(g => g.id === n.gameId);
              const fromPlayerName = fromUser?.playerName || fromUser?.displayName || "Unknown user";

              return (
                <ListItem 
                  key={n.id} 
                  className={`group cursor-pointer hover:bg-slate-50 transition-colors rounded-xl p-3 items-start mb-1 ${n.isRead ? 'opacity-50 grayscale-[0.5]' : ''}`}
                  onClick={() => {
                    if (!n.isRead) dismissNotification(n.id);
                    navigate(`/view/${n.playId}`, { state: { scrollToComments: true } });
                  }}
                >
                  <ListItemIcon>
                    {/* AVATARS: User and Game icons are same size, overlapping slightly */}
                    <div className="flex items-center flex-shrink-0">
                      <div className="relative flex items-center">
                        {fromUser?.photoURL ? (
                          <img 
                            src={fromUser.photoURL} 
                            alt={fromPlayerName} 
                            className="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white z-10"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shadow-sm border-2 border-white z-10">
                            <IconPerson />
                          </div>
                        )}
                        {game?.icon && (
                          <img 
                            src={game.icon} 
                            alt={game.name} 
                            className="w-10 h-10 rounded-full border-2 border-white object-cover bg-white shadow-sm -ml-4"
                          />
                        )}
                      </div>
                    </div>
                  </ListItemIcon>

                  <ListItemText 
                    title={
                      <div className="flex flex-col text-slate-700 font-normal pr-2 leading-snug">
                        {/* TEXT: More natural phrasing, highlights both user and game clearly */}
                        <span className={`font-normal mb-1 ${n.isRead ? 'text-slate-500' : 'text-slate-800'}`}>
                          <span className="font-semibold">{fromPlayerName}</span> commented on your <span className="font-semibold">{game?.name || "game"}</span> play: <span className="italic">"{n.playName}"</span>
                        </span>
                        {/* DATE: Moved below the action, lighter color */}
                        <span className="text-xs text-slate-400 font-medium">
                           {/* Swapping in the simple relative formatter here, but you can stick to your original convertToPlainDate if preferred */}
                          {formatRelativeDate(n.created.toString())}
                        </span>
                      </div>
                    }
                  />

                  {/* DISMISS BUTTON: Only show if unread */}
                  {!n.isRead && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(n.id);
                      }}
                      className="p-1.5 mt-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0 opacity-60 group-hover:opacity-100"
                      aria-label="Mark read"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </ListItem>
              );
            })}
          </List>
        </div>

        {/* FOOTER: Simplified to a single clear 'Close' action */}
        <div className="p-4 bg-white border-t border-slate-100">
          <ButtonPrimary className="w-full py-2.5 text-base" onClick={() => setIsVisible(false)}>
            Close
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
