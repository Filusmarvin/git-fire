import React, { Component } from 'react';
import axios from 'axios';
import ProjectSearchResult from './ProjectSearchResult';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import base from './rebase';
import logo from './logo.svg';
import './App.css';
import MiniProject from './MiniProject'
import MoreDetails from './MoreDetails'

window.base = base;

class App extends Component {

  constructor () {
    super();
    this.state = {
      user: {},
      searchResults: {},
      users: [],
      projects: [],
      extraData:{},
      ownerData:{}
    }
  }

  componentDidMount () {
    // whenever user logs in or out, run setUserState
    base.onAuth(this.setUserState.bind(this));
  }

  setUserState (user) {
    this.setState({
      user: user || {}
    });
    if (user) {
      this.offSwitchForProjects = base.syncState(`users/${user.uid}/projects`, {
        context: this,
        asArray: true,
        state: 'projects'
      });
      this.offSwitchForUsers = base.syncState(`users/${user.uid}/users`, {
        context: this,
        asArray: true,
        state: 'users'
      });
    }
  }

  componentWillUnmount () {
    base.removeBinding(this.offSwitchForUsers);
    base.removeBinding(this.offSwitchForProjects);
  }

  login () {
    base.authWithOAuthPopup('github', function (){});
  }

  logout () {
    base.unauth()
  }

  loginOrLogoutButton () {
    if (this.state.user.uid) {
      return <button onClick={this.logout.bind(this)}>Logout</button>
    } else {
      return <button onClick={this.login.bind(this)}>Login</button>
    }
  }

  searchGithubProjects (event) {
    event.preventDefault();
    const project = this.projectName.value;
    axios.get(`https://api.github.com/search/repositories?q=${project}&per_page=5`)
    // .then(response => console.log(response))
    .then(response => this.setState({ searchResults: response.data }));
    this.projectName.value = '';
    console.log(this.state.projects)
  }

  formIfLoggedIn () {
    if (this.state.user.uid) {
      return (
        <form onSubmit={this.searchGithubProjects.bind(this)}>
          <input
            placeholder='Favorite GitHub Projects'
            ref={element => this.projectName = element} />
          <button>Search GitHub Repos </button>
        </form>
      )
    }
  }

  displaySearchResults () {
    if (this.state.searchResults.items) {
      const results = this.state.searchResults;
      const projectIds = this.state.projects.map(p => p.id);
      return (
        <div>
          <h3>{results.total_count} Results</h3>
          <ul>
            {results.items.map((project, index) => {
              return <ProjectSearchResult key={index} project={project}
              alreadyInFirebase={projectIds.includes(project.id)}
              addProject={this.addProject.bind(this)}
              deleteProject={this.deleteProject.bind(this)} />
            }
            )}
          </ul>
        </div>
      )
    }
  }

  addProject (project) {
    const projectData = { name: project.name, id: project.id}
    this.setState({
      projects: this.state.projects.concat(projectData)
    });
  }
  deleteProject (project) {
    const projectData = { name: project.name, id: project.id }
    this.setState({
      projects: this.state.projects.filter( obj => obj.id !== project.id )

    });
  }
  something () {
    axios.get(`https://api.github.com/repositories/39316535`)
    .then( response =>  this.setState({ extraData: response.data,
    ownerData: response.data.owner }))
  }




  render() {
    return (
      <Router>
        <div className="App">
          <p className="App-intro">
            {this.loginOrLogoutButton()}
          </p>
          {this.formIfLoggedIn()}
          <div className="git-fire">
            {this.displaySearchResults()}
            <ul>
              < MiniProject project={this.state.projects} />
            </ul>
          </div>
          <Route exact path="/" component={ProjectSearchResult} />
          <Route path="/MoreDetail" render={(pickles) => <MoreDetails data={this.state.extraData}
            ownerData={this.state.ownerData} {...pickles} />} />
            <button onClick={this.something.bind(this)} >
            <Link to="/MoreDetails"> Click Me </Link> </button>
        </div>
      </Router>
    );
  }
}

export default App;
