import React from "react";
import "../../CSS/profile.css";
import { IconUser } from "../../../assets/ui-icons.jsx";

const Profile = () => {
  return (
    <div className="profile-container">
      <div className="header2">
        <div className="user-info">
          <div className="profile-user-name">UserName</div>
          <IconUser SVGClassName={"profile-user-icon"} />
        </div>
      </div>
      <div className="content-container">
        <div className="profile">
          <div className="profile-to-edit">
            <IconUser SVGClassName={"user-icon-to-edit"} />
            <span className="user-name-to-edit">UserName</span>
          </div>
          <button className="edit-profile-button">
            <span className="editProfileButtonText">Edit Profile</span>
          </button>
        </div>
        <div className="vertical-separator"></div>
        <div className="projects-panel">
          <span className="project-panel-name">My projects</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
