import React from 'react';
import { HomePageSearchBar } from '@backstage/plugin-search';
import { Grid, makeStyles, Typography, Box } from '@material-ui/core';
import {
  Content,
  Page,
  Header,
  InfoCard,
  Link as BackstageLink,
} from '@backstage/core-components';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import CategoryIcon from '@material-ui/icons/Category';
import ExtensionIcon from '@material-ui/icons/Extension';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import CreateComponentIcon from '@material-ui/icons/AddCircleOutline';

const useStyles = makeStyles(theme => ({
  searchBar: {
    display: 'flex',
    maxWidth: '60vw',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(4, 'auto'),
  },
  welcomeCard: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  linkCard: {
    height: '100%',
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'none',
      transform: 'translateY(-4px)',
      transition: 'transform 0.2s ease-in-out',
    },
  },
  sectionTitle: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

const QuickLinkCard = ({ icon, title, description, to }: any) => {
  const classes = useStyles();
  return (
    <BackstageLink to={to} className={classes.linkCard}>
      <InfoCard
        title={
          <div className={classes.iconContainer}>
            {icon}
            <Typography variant="h6">{title}</Typography>
          </div>
        }
      >
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </InfoCard>
    </BackstageLink>
  );
};

export const HomePage = () => {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const [userName, setUserName] = React.useState<string>('');

  React.useEffect(() => {
    identityApi.getBackstageIdentity().then(identity => {
      const name = identity.userEntityRef.split('/')[1];
      setUserName(name);
    });
  }, [identityApi]);

  return (
    <Page themeId="home">
      <Header title={`Welcome${userName ? `, ${userName}` : ''}!`} />
      <Content>
        <Grid container spacing={3}>
          {/* Welcome Section */}
          <Grid item xs={12}>
            <InfoCard className={classes.welcomeCard}>
              <Typography variant="h2" gutterBottom>
                Welcome to Backstage
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Your one-stop shop for building great developer experiences.
                Discover, explore, and manage your software ecosystem.
              </Typography>
            </InfoCard>
          </Grid>

          {/* Search Bar */}
          <Grid item xs={12}>
            <Box className={classes.searchBar}>
              <HomePageSearchBar />
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12}>
            <Typography variant="h4" className={classes.sectionTitle}>
              Quick Links
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickLinkCard
              icon={<CategoryIcon />}
              title="Catalog"
              description="Browse all your services, APIs, and resources"
              to="/catalog"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickLinkCard
              icon={<ExtensionIcon />}
              title="APIs"
              description="Explore and test your APIs"
              to="/api-docs"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickLinkCard
              icon={<LibraryBooks />}
              title="Docs"
              description="Browse technical documentation"
              to="/docs"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickLinkCard
              icon={<CreateComponentIcon />}
              title="Create"
              description="Create a new component"
              to="/create"
            />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
