import React, { useState } from "react";
import "./settings.css";

function SettingsForm() {
    const [settings, setSettings] = useState({
        option1: "",
        option2: "",
        // Add more settings as needed
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log("Settings submitted:", settings);
    };

    return (
        <div className="settings-container">
            <h1>Settings</h1>
            <form onSubmit={handleSubmit}>
                <label>Option 1:</label>
                <input
                    type="text"
                    name="option1"
                    value={settings.option1}
                    onChange={handleChange}
                    required
                />

                <label>Option 2:</label>
                <input
                    type="text"
                    name="option2"
                    value={settings.option2}
                    onChange={handleChange}
                    required
                />

                <button type="submit">Save Settings</button>
            </form>
        </div>
    );
}

export default SettingsForm;
