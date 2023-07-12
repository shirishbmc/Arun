import * as React from 'react';
import styles from './QrGenerator.module.scss';
import { IQrGeneratorProps } from './IQrGeneratorProps';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/components/Dropdown';
import { TextField } from '@fluentui/react/lib/components/TextField';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/components/Button';
import { Label } from '@fluentui/react/lib/components/Label';
import { VerticalDivider } from '@fluentui/react/lib/components/Divider';
import { HttpClient, IHttpClientOptions, HttpClientResponse } from '@microsoft/sp-http';
import { Image } from '@fluentui/react/lib/components/Image';

const BitlyClient = require('bitly').BitlyClient;
const bitly = new BitlyClient('c5e59588362ef7521a5624942ef705280c171bc7');

export interface IQrGeneratorState{
  longUrl: string;
  shortenUrl: string;
  selectedGuid: string | number;
  qrCode: any;
}

const _options:IDropdownOption[] = [
  { key: 'B0110j6JDxR', text: 'Self service' },
  { key: 'B011092YQki', text: 'Splash Events' },  
  { key: 'B0110GsoBz4', text: 'Seismic' },  
  { key: 'B0110AJQkNQ', text: 'WI Talent' },
]
const userToken = 'c5e59588362ef7521a5624942ef705280c171bc7';

export default class QrGenerator extends React.Component<IQrGeneratorProps, IQrGeneratorState> {  
  constructor(props:IQrGeneratorProps, state:IQrGeneratorState){
    super(props);  
    this.state = {
      longUrl: '',
      shortenUrl: '',
      selectedGuid: '',
      qrCode: null
    }         
  }  
  public render(): React.ReactElement<IQrGeneratorProps> {
    
    return (
      <section className={`${styles.qrGenerator}`}>
        <div className={styles.title}>
          {this.props.title}
        </div> 
        <div className={styles.container}>
          <div className={styles.controls}>
            <TextField label='URL:' onChange={(ev, val)=> this.setState({ longUrl: val})} />
            <Dropdown
            label='Select an option:'
            options={_options}
            onChange={(ev, option, index)=>{this.setState({ selectedGuid: option.key })}}
            />
            <div className={styles.buttons}>
              <PrimaryButton text='Generate' onClick={this.generateShortLink} />
              <DefaultButton text='Clear' className={styles.defaultButton} onClick={()=> this.setState({ longUrl:'' })} />
            </div>
          </div>
          <VerticalDivider />
          <div className={styles.result}>
            <div style={{ display:'flex' }}>
              <Label>Shortend URL:</Label>
              <Label className={styles.shortUrl}>{this.state.shortenUrl}</Label>
            </div>            
            <div>
            <Label>QR Code:</Label>
            <Image src={this.state.qrCode} style={{ height:'200px' }} />
            </div>
          </div>
        </div>               
      </section>
    );
  }

  private generateShortLink = async() => {        
    var payload = {
      long_url: this.state.longUrl,
      domain: 'link.fidelity.com',
      group_guid: this.state.selectedGuid,
    } 
    let shortenLinkResponse = await bitly.bitlyRequest('shorten', payload);
    console.log(shortenLinkResponse);
    this.setState({
      shortenUrl: shortenLinkResponse.link
    },async()=>{
      let link = this.state.shortenUrl.replace(/(^\w+:|^)\/\//, '');
      
      let qrRequest = {
        color: "1133ff",
        exclude_bitly_logo: true,
        image_format: "png",              
      }

      let headers:IHttpClientOptions = {
        method: 'POST',
        headers:{
          'Authorization': 'Bearer c5e59588362ef7521a5624942ef705280c171bc7',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(qrRequest)        
      }     
      this.props.httpClient.fetch('https://api-ssl.bitly.com/v4/bitlinks/'+ link +'/qr', HttpClient.configurations.v1, headers ).then((response: HttpClientResponse) => {  
        return response.json();  
      })  
      .then(jsonResponse => {  
        console.log(jsonResponse);  
        this.setState({
          qrCode: jsonResponse.qr_code
        })
        
      });     
    })
  }
}
