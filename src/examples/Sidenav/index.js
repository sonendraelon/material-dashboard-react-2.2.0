import React, { useEffect, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import Collapse from "@mui/material/Collapse";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");

  // State to manage expanded/collapsed state of menu items
  const [expandedMenus, setExpandedMenus] = useState({});

  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  // Toggle menu expansion
  const toggleMenu = (key) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    window.addEventListener("resize", handleMiniSidenav);
    handleMiniSidenav();

    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  // Render routes with submenu support
  const renderRoutes = routes.map(
    ({ type, name, icon, title, noCollapse, key, href, route, collapse }) => {
      let returnValue;

      if (type === "collapse") {
        // Check if the item has nested routes
        const hasSubRoutes = collapse && collapse.length > 0;

        returnValue = (
          <React.Fragment key={key}>
            {href ? (
              <Link
                href={href}
                key={key}
                target="_blank"
                rel="noreferrer"
                sx={{ textDecoration: "none" }}
              >
                <SidenavCollapse
                  name={name}
                  icon={icon}
                  active={key === collapseName}
                  noCollapse={noCollapse}
                  onClick={hasSubRoutes ? () => toggleMenu(key) : undefined}
                  rightIcon={
                    hasSubRoutes ? (
                      <Icon
                        sx={{
                          transform: expandedMenus[key] ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.3s",
                        }}
                      >
                        {expandedMenus[key] ? "expand_less" : "expand_more"}
                      </Icon>
                    ) : null
                  }
                />
              </Link>
            ) : (
              <NavLink key={key} to={route}>
                <SidenavCollapse
                  name={name}
                  icon={icon}
                  active={key === collapseName}
                  onClick={hasSubRoutes ? () => toggleMenu(key) : undefined}
                  rightIcon={
                    hasSubRoutes ? (
                      <Icon
                        sx={{
                          transform: expandedMenus[key] ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.3s",
                        }}
                      >
                        {expandedMenus[key] ? "expand_less" : "expand_more"}
                      </Icon>
                    ) : null
                  }
                />
              </NavLink>
            )}

            {/* Render nested routes with collapse */}
            {hasSubRoutes && (
              <Collapse in={expandedMenus[key]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {collapse.map((subRoute) => (
                    <NavLink
                      key={subRoute.key}
                      to={subRoute.route}
                      style={{ textDecoration: "none" }}
                    >
                      <SidenavCollapse
                        name={subRoute.name}
                        icon={subRoute.icon || icon}
                        active={subRoute.key === collapseName}
                        sx={{ pl: 4 }}
                      />
                    </NavLink>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        );
      } else if (type === "title") {
        returnValue = (
          <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={3}
            mt={2}
            mb={1}
            ml={1}
          >
            {title}
          </MDTypography>
        );
      } else if (type === "divider") {
        returnValue = (
          <Divider
            key={key}
            light={
              (!darkMode && !whiteSidenav && !transparentSidenav) ||
              (darkMode && !transparentSidenav && whiteSidenav)
            }
          />
        );
      }

      return returnValue;
    }
  );

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      <MDBox
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={2}
        onClick={() => toggleMenu("logo")}
        sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
      >
        <img src={brand} alt={brandName} width="100%" />
      </MDBox>
      <List>{renderRoutes}</List>
      {/* Upgrade button remains unchanged */}
    </SidenavRoot>
  );
}

// Prop type definitions remain the same
Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
