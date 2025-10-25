export const centeredBoxStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  py: 4,
};

export const paperStyle = {
  p: 4,
  borderRadius: 3,
  backgroundColor: "white",
};

export const logoBoxStyle = {
  display: "flex",
  justifyContent: "center",
  mb: 3,
};

export const avatarStyle = {
  width: 80,
  height: 80,
  backgroundColor: "primary.light",
};

export const titleBoxStyle = {
  textAlign: "center",
  mb: 4,
};

export const emailBoxStyle = {
  mb: 3,
};

export const passwordBoxStyle = {
  mb: 3,
};

export const loginButtonStyle = {
  mb: 3,
  py: 1.5,
  fontWeight: 600,
  fontSize: "1rem",
};

export const dividerStyle = {
  mb: 3,
};

export const socialButtonStyle = {
  mb: 2,
  py: 1.5,
  fontWeight: 600,
  borderColor: "grey.300",
  color: "text.primary",
  "&:hover": {
    borderColor: "grey.400",
    backgroundColor: "grey.50",
  },
};

export const facebookButtonStyle = {
  ...socialButtonStyle,
  mb: 3,
};

export const footerLinksStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 1,
};

export const linkStyle = {
  color: "primary.main",
  fontWeight: 600,
  fontSize: "0.9rem",
};

export const registerLinkStyle = {
  color: "primary.main",
  fontWeight: 600,
};

export const schoolIconStyle = {
  fontSize: 48,
  color: "primary.main",
};
