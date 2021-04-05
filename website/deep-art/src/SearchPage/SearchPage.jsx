import React, { Component } from 'react';
import styled from "styled-components";

import SelectControl from './SelectControl.jsx';
import ResultArt from './ResultArt.jsx';

import { Box, Button, Grid, Paragraph, Text } from 'grommet';



import landscape from '../images/testLandscape.jpg';
import portrait from '../images/testPortrait.jpg';
import vase from '../images/testVase.jpg';
import error from '../images/testError.png';


export default class SearchPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            selectedIndex: 0,
            selectedImage: 0,
            imgObjects: []
        };

        this.changeSelect = this.changeSelect.bind(this);
        this.changeSelectedImage = this.changeSelectedImage.bind(this);
        this.getImageIDs = this.getImageIDs.bind(this);
        this.clearOldImages = this.clearOldImages.bind(this);
    };

    //these are the initial images that are displayed when the page loads
    componentDidMount(){
        this.objIDsToImages([34, 1439, 2134, 2348, 2392, 2393, 2552, 3110, 3297, 3315, 3318, 4401]);
    }

    changeSelect(index){
        this.setState({ selectedIndex: index });
        //Call CSV API and change imgObjects accordingly
    }

    changeSelectedImage(ID){
        //Unclear if this is a better system or not
        if (ID === this.state.selectedImage){
            this.setState({selectedImage: 0});
        }else{
            this.setState({selectedImage: ID});
        }
        
    }

    getImageIDs(imageIDs) {
        this.objIDsToImages(imageIDs);
    }

    clearOldImages() {
        this.state.imgObjects = []; 
    }

    /**
     * 
     * @param {Int[]} objIDs - An array of object IDs from the met API to convert to an array of image urls
     * @return {String[]} - An array of image urls from the met API.
     */
    objIDsToImages(objIDs) {
        
        const baseURL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';
        
        let apiURLs = objIDs.map(ID => (
            {url: baseURL+ID.toString(),
             id: ID}
        ));

        for (let i = 0; i < apiURLs.length; i++){
            const Http = new XMLHttpRequest();
            Http.open("GET", apiURLs[i].url);
            Http.send();
            Http.onreadystatechange = (e) => {
                if (Http.readyState === 4){
                    try {
                        let response = JSON.parse(Http.responseText);
                        this.setState((oldState) => {
                            return oldState.imgObjects.push(
                                {img: response.primaryImage,
                                 id: apiURLs[i].id} 
                                )
                        })
                    } catch (e) {
                        console.log('malformed request:' + Http.responseText);
                    }
                }
            }
        }
    }

    generateArtUrlSuffix() {
        const NUMBER_OF_SEARCH_IMAGES = 12;
        let urlBase = "/explore/";
        if (this.state.imgObjects.length === NUMBER_OF_SEARCH_IMAGES) {
            //generates a random index for which to eliminate the extra met art
            //idea is we randomly select which curated art to move to the explore page
            let currentSelection = this.state.selectedImage;
            let numberToEliminate = NUMBER_OF_SEARCH_IMAGES - 9 - 1;
            let maxNumberToRemove = (NUMBER_OF_SEARCH_IMAGES - 1) - (numberToEliminate - 1);
            let randomSpliceIndex = Math.floor(Math.random() * maxNumberToRemove);
            let idList = this.state.imgObjects.map(ob => ob.id);
            idList.splice(idList.indexOf(currentSelection), 1);
            idList.splice(randomSpliceIndex, numberToEliminate);

            let url = "?id=" + this.state.selectedImage.toString() + "&ids=[" + idList.toString() + "]";
            url = encodeURIComponent(url);
            console.log("url:" + url);
            //url = decodeURIComponent(url);
            //console.log("url:" + url);
            return urlBase + url;
        }
        

        //return url;
    }

    render() {
        return(
            <Grid
                areas={[
                    { name: 'left', start: [0, 0], end: [0, 3] },
                    { name: 'desc', start: [1, 0], end: [1, 0] },
                    { name: 'tags', start: [1, 1], end: [1, 1] },
                    { name: 'select', start: [1, 2], end: [1, 2] },
                    { name: 'buttons', start: [1, 3], end: [1, 3]},
                    { name: 'right', start: [2, 0], end: [2, 3] },
                ]}
                columns={['flex','large','flex']}
                rows={['small','xsmall','large','xsmall']}
                gap='small'
            >
                <Box gridArea='desc' >
                    <Paragraph
                        style={{ textAlign: 'center', marginTop: '20px' }}
                        alignSelf={"center"}
                        size={"large"}
                    >
                    Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit, qui in ea voluptate velit esse, quam nihil molestiae consequatur, vel illum, qui dolorem eum fugiat, quo voluptas nulla pariatur?
                    </Paragraph>
                </Box>
                <Box gridArea='tags' direction='row' align='center' justify="center">
                    <Text>
                        Choose a category:
                    </Text>
                    <SelectControl
                        sendObjectIds={this.getImageIDs}
                        clearOldImages={this.clearOldImages}
                    />
                </Box>
                <Box gridArea='select'>
                    <ResultArt
                        images={this.state.imgObjects}
                        selectedImage={this.state.selectedImage}
                        selectImage={this.changeSelectedImage}
                    />
                </Box>
                <Box gridArea='buttons'>
                    <Box direction='row' style={{justifyContent: 'space-around'}}>
                        <Box>
                            <Button label='Generate Image' href={this.generateArtUrlSuffix()} />
                        </Box>
                        <Box>
                            <Button label='Explore Similar'/>
                        </Box>
                    </Box>

                    
                </Box>
                <Box gridArea='left'/>
                <Box gridArea='right' />
            </Grid>
        );
    }
}