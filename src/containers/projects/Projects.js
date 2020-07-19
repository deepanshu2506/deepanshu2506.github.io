import React, { useState, useEffect, lazy, Suspense } from "react";
import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";
import "./Project.css";
import Button from "../../components/button/Button";
import Loading from "../loading/Loading";
import { openSource, socialMediaLinks } from "../../portfolio";
import { Fade } from "react-reveal";

export default function Projects() {
  const GithubRepoCard = lazy(() =>
    import("../../components/githubRepoCard/GithubRepoCard")
  );
  const FailedLoading = () => null;
  const renderLoader = () => <Loading />;
  const [repo, setrepo] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    getRepoData();
  }, []);

  function getRepoData() {
    const client = new ApolloClient({
      uri: "https://api.github.com/graphql",
      request: (operation) => {
        operation.setContext({
          headers: {
            authorization: `Bearer ${openSource.githubConvertedToken}`,
          },
        });
      },
    });

    client
      .query({
        query: gql`
        {
        user(login: "${openSource.githubUserName}") {
          contributionsCollection{
            totalPullRequestContributions
            totalCommitContributions
            totalRepositoriesWithContributedCommits 
            totalPullRequestReviewContributions 
          }
          topRepositories(first: 10,orderBy:{field:NAME , direction:ASC}) {
            totalCount
            edges {
              node {
                ... on Repository {
                  name
                  description
                  forkCount
                  stargazers {
                    totalCount
                  }
                  url
                  id
                  diskUsage
                  primaryLanguage {
                    name
                    color
                  }
                }
              }
            }
          }
        }
      }
        `,
      })
      .then((result) => {
        console.log(result);
        setrepoFunction(result.data.user.topRepositories.edges);
        setStats(result.data.user.contributionsCollection);
        console.log(result);
      })
      .catch(function (error) {
        console.log(error);
        setrepoFunction("Error");
        setStats("Error");
        console.log(
          "Because of this Error, nothing is shown in place of Projects section. Projects section not configured"
        );
      });
  }

  function setrepoFunction(array) {
    setrepo(array);
  }
  if (!(typeof repo === "string" || repo instanceof String)) {
    console.log(stats);
    return (
      <Suspense fallback={renderLoader()}>
        <div className="main" id="opensource">
          <h1 className="project-title">Top contributed Repositories</h1>
          <div className="repo-cards-div-main">
            {repo.map((v, i) => {
              return v && <GithubRepoCard repo={v} key={v.node.id} />;
            })}
          </div>
          <Button
            text={"More Projects"}
            className="project-button"
            href={socialMediaLinks.github}
            newTab={true}
          />
          <h1 className="contribution-stats">Contribution Statistics</h1>
          <Fade bottom duration={1000} distance="20px">
            <div className="contribution-stats-cards-main">
              <div className="contribution-stats-card-div">
                <h1>{stats.totalCommitContributions}+</h1>
                <h4>Commits</h4>
              </div>
              <div className="contribution-stats-card-div">
                <h1>{stats.totalPullRequestContributions}+</h1>
                <h4>Pull Requests</h4>
              </div>
              <div className="contribution-stats-card-div">
                <h1>{stats.totalPullRequestReviewContributions}+</h1>
                <h4>PR Reviews</h4>
              </div>
            </div>
          </Fade>
        </div>
      </Suspense>
    );
  } else {
    return <FailedLoading />;
  }
}
