import React from "react";
import "../CSS/profile.css";
import UserIcon from "../../assets/userIcon.png";
import { IconUser } from "../../assets/ui-icons.jsx";

const Profile = () => {
  return (
    <div className="profile-container">
      <div className="header2">
        <div className="user-info">
          <div className="profileUserName">UserName</div>
          <IconUser SVGClassName={"profileUserIcon"} />
        </div>
      </div>
      <div className="content-container">
        <div className="profile">
          <div className="profileToEdit">
            <IconUser SVGClassName={"userIconToEdit"} />
            <span className="userNameToEdit">UserName</span>
          </div>
          <button className="editProfileButton">
            <span className="editProfileButtonText">Edit Profile</span>
          </button>
        </div>
        <div className="vertical-separator"></div>
        <div className="projectsPanel">
          <span className="projectPanelName">My projects</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
