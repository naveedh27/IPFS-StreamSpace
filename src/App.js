import React, { Component } from 'react';
import './App.css';
import { Table, Grid, Segment } from 'semantic-ui-react';
import Layout from './components/Layout';
import 'semantic-ui-css/semantic.min.css';
import Axios from 'axios';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      peers: {},
      rowData: '',
      isIPFSdown: true,
      totalBW: {}
    }

  }

  async componentWillMount() {

    this.getStatus();

  }

  componentDidMount() {
    setInterval(this.getStatus, 5000);
  }

  getStatus = async () => {

    try {

      let versionData = (await Axios.get('http://localhost:5001/api/v0/version')).data;
      this.setState({ isIPFSdown: false });

      this.fetchIPFSData();

    } catch (e) {
      this.setState({ isIPFSdown: true });
    }

  }

  fetchIPFSData = async () => {

    try {

      let trData = [], eachPeer = '', rateIn = '', rateOut = '', tableData = [];

      const BW = (await Axios.get('http://localhost:5001/api/v0/stats/bw')).data;

      this.setState({ totalBW: BW });

      const rawData = (await Axios.get('http://localhost:5001/api/v0/swarm/peers')).data.Peers;


      let limit = rawData.length > 50 ? 50 : rawData.length;

      for (var i = 0; i < limit; i++) {

        eachPeer = (await Axios.get('http://localhost:5001/api/v0/stats/bw?peer=' + rawData[i].Peer)).data;

        rateIn = parseFloat(eachPeer.RateIn).toFixed(2);
        rateOut = parseFloat(eachPeer.RateOut).toFixed(2);

        trData.push(
          <Table.Row key={i} positive={(rateIn === '0.00' || rateOut === '0.00') ? false : true}>
            <Table.Cell>{rawData[i].Addr.split('/')[2]}</Table.Cell>
            <Table.Cell>{rawData[i].Addr.split('/')[4]}</Table.Cell>
            <Table.Cell>{rawData[i].Peer}</Table.Cell>
            <Table.Cell>{eachPeer.TotalIn}</Table.Cell>
            <Table.Cell>{eachPeer.TotalOut}</Table.Cell>
            <Table.Cell>{rateIn}</Table.Cell>
            <Table.Cell>{rateOut}</Table.Cell>
          </Table.Row>
        );

      }

      tableData.push(
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>IP Address</Table.HeaderCell>
              <Table.HeaderCell>Port</Table.HeaderCell>
              <Table.HeaderCell>Peer ID</Table.HeaderCell>
              <Table.HeaderCell>Total In</Table.HeaderCell>
              <Table.HeaderCell>Total Out</Table.HeaderCell>
              <Table.HeaderCell>Rate In</Table.HeaderCell>
              <Table.HeaderCell>Rate Out</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {trData}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
            </Table.Row>
          </Table.Footer>
        </Table>);

      this.setState({ rowData: tableData });

    } catch (e) {
      console.log('IPFS API Node is down.' + e)
    }

  }

  render() {
    return (
      <Layout>
        <Segment className="topHeader">
          <Grid>
            <Grid.Row columns="16">
              <Grid.Column width="8" as="h4">
                Total Inward Data : {this.state.totalBW.TotalIn}
            </Grid.Column>
              <Grid.Column width="8" as="h4">
                Total Outward Data : {this.state.totalBW.TotalOut}
            </Grid.Column>
            </Grid.Row>
            <Grid.Row columns="16">
              <Grid.Column width="8" as="h4">
               Inward Data Rate : {this.state.totalBW.RateIn}
            </Grid.Column>
              <Grid.Column width="8" as="h4">
               Outward Data Rate : {this.state.totalBW.RateOut}
            </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
        (*Showing Top 50 Peers*)
        {(this.state.isIPFSdown) ? 'Connecting to IPFS API ...' : this.state.rowData}

      </Layout>
    );
  }
}

export default App;
