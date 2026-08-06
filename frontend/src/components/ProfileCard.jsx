import React, { useState } from 'react';
import { Pencil, X, Check } from 'lucide-react';

const STORAGE_KEY = 'profile';

const defaultProfile = { name: 'Jacob', role: 'Student', initials: 'JD' };

const loadProfile = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.name && stored?.role && stored?.initials) return stored;
  } catch {
    // fall through to default
  }
  return defaultProfile;
};

const ProfileCard = () => {
  const [profile, setProfile] = useState(loadProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  const openEditor = () => {
    setDraft(profile);
    setEditing(true);
  };

  const save = (e) => {
    e.preventDefault();
    const cleaned = {
      name: draft.name.trim() || defaultProfile.name,
      role: draft.role.trim() || defaultProfile.role,
      initials: (draft.initials.trim() || draft.name.trim().slice(0, 2) || defaultProfile.initials).slice(0, 2).toUpperCase(),
    };
    setProfile(cleaned);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    setEditing(false);
  };

  if (editing) {
    return (
      <form onSubmit={save} className="px-6 mb-8 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <input
            value={draft.initials}
            onChange={(e) => setDraft({ ...draft, initials: e.target.value })}
            maxLength={2}
            className="flex items-center justify-center w-12 h-12 text-lg font-bold text-center text-white bg-gray-900 dark:bg-blue-600 rounded-full uppercase focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-blue-400"
          />
          <div className="flex-1 flex flex-col gap-2">
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Name"
              className="text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-blue-400"
            />
            <input
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              placeholder="Role"
              className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-blue-400"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="submit"
            className="p-1.5 rounded-lg text-white bg-gray-900 dark:bg-blue-600 hover:opacity-90"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="group flex items-center gap-4 px-6 mb-8">
      <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white bg-gray-900 dark:bg-blue-600 rounded-full uppercase">
        {profile.initials}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">{profile.name}</h2>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{profile.role}</p>
      </div>
      <button
        onClick={openEditor}
        aria-label="Edit profile"
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-opacity"
      >
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ProfileCard;
