"use client";

import React from "react";
import styles from "./LearnMoreButton.module.css";

const LearnMoreButton = ({ text = "Learn More", onClick, className = "" }) => {
  return (
    <button className={`${styles.button} ${styles.learnMore} ${className}`} onClick={onClick}>
      <span className={styles.circle} aria-hidden="true">
        <span className={`${styles.icon} ${styles.arrow}`}></span>
      </span>
      <span className={styles.buttonText}>{text}</span>
    </button>
  );
};

export default LearnMoreButton;
