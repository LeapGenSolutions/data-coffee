import { useEffect, useState, useRef } from "react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export default function UserMultiSelect({ selected, onChange }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  // Static user list
  useEffect(() => {
    const mockUsers = [
      { name: "Gayathri", email: "gayathri.t@leapgen.ai" },
      { name: "Maithreyi Suresh", email: "maithreyi@leapgen.ai" },
      { name: "Anurag Donapati", email: "anurag.d@leapgen.ai" },
      { name: "Ganga Raju", email: "ganga.raju@leapgen.ai" },
      { name: "Goutham mosya", email: "goutham@leapgen.ai" },
      { name: "Madhu", email: "madhu@leapgen.ai" },
      { name: "Vamshi", email: "vamshi.dulam@leapgen.ai" },
      { name: "Vasu ", email: "vasu.g@leapgen.ai" },
    ];
    setUsers(mockUsers);
    setFiltered(mockUsers);
  }, []);

  // Filter based on search
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(users);
    } else {
      setFiltered(
        users.filter(
          (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, users]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (email) => {
    if (selected.includes(email)) {
      onChange(selected.filter((e) => e !== email));
    } else {
      onChange([...selected, email]);
    }
  };

  const handleRemove = (email) => {
    onChange(selected.filter((e) => e !== email));
  };

  const displayLabel = selected.length === 0
    ? "Search users..."
    : `${selected.length} selected`;

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Search Input with Dropdown Icon */}
      <div className="relative">
        <Input
          placeholder={displayLabel}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (filtered.length > 0) {
                handleToggle(filtered[0].email);
              }
            }
          }}
          className="pr-10 text-sm"
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <div
          className="absolute left-0 top-full mt-1 w-full max-h-48 overflow-y-auto rounded-md border bg-white shadow-md z-20"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
          ) : (
            filtered.map((user) => (
              <label
                key={user.email}
                className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-sm"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(user.email)}
                    onChange={() => handleToggle(user.email)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-sm">{user.name}</span>
                </div>
                <span className="text-xs text-gray-500">{user.email}</span>
              </label>
            ))
          )}
        </div>
      )}

      {/* Selected Users as Badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map((email) => {
            const user = users.find((u) => u.email === email);
            return (
              <Badge key={email} variant="secondary" className="flex items-center gap-2 text-xs">
                {user?.name || email}
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => handleRemove(email)}
                  className="text-xs p-0"
                >
                  ✕
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
