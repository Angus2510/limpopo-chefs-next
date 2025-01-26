const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: document.documentElement.classList.contains('dark') ? (state.isFocused ? "#2D3748" : "#1A202C") : (state.isFocused ? "#E2E8F0" : "#FFF"),
      borderColor: document.documentElement.classList.contains('dark') ? (state.isFocused ? "#4A5568" : "#2D3748") : (state.isFocused ? "#4d7c54" : "#CBD5E0"),
      color: document.documentElement.classList.contains('dark') ? "#A0AEC0" : "#1A202C",
      boxShadow: state.isFocused ? "0 0 0 1px #4A5568" : "none",
      '&:hover': {
        borderColor: document.documentElement.classList.contains('dark') ? "#4A5568" : "#A0AEC0",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: document.documentElement.classList.contains('dark') ? "#1A202C" : "#FFF",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? document.documentElement.classList.contains('dark') ? "#4A5568" : "#E2E8F0"
        : state.isFocused
        ? document.documentElement.classList.contains('dark') ? "#2D3748" : "#EDF2F7"
        : document.documentElement.classList.contains('dark') ? "#1A202C" : "#FFF",
      color: state.isSelected
        ? "#FFF"
        : document.documentElement.classList.contains('dark') ? "#A0AEC0" : "#1A202C",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: document.documentElement.classList.contains('dark') ? "#A0AEC0" : "#1A202C",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: document.documentElement.classList.contains('dark') ? "#4A5568" : "#E2E8F0",
      color: document.documentElement.classList.contains('dark') ? "#A0AEC0" : "#1A202C",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: document.documentElement.classList.contains('dark') ? "#A0AEC0" : "#1A202C",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: document.documentElement.classList.contains('dark') ? "#A0AEC0" : "#1A202C",
      '&:hover': {
        backgroundColor: document.documentElement.classList.contains('dark') ? "#2D3748" : "#E2E8F0",
        color: "#FFF",
      },
    }),
  };
  
  export default customStyles;
  