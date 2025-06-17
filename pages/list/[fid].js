import Head from 'next/head'
import React, { useState } from 'react';
import styles from '../../styles/Home.module.css'
import HeaderImage from '../../components/HeaderImage';
import GoogleDriveSearch from '../../components/GoogleDriveSearch'
import SimpleSignOn from '../../components/SimpleSignOn'
import PlayBookFolders from '../../components/PlayBookFolders';
import PlayBookFiles from '../../components/PlayBookFiles';
import FolderName from '../../components/FolderName';

export default function Drilldown() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Google Drive By Onext Digital</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

     
        <main className={styles.main}>

          <PlayBookFiles />

        </main>

        <footer className={styles.footer}>
          
        </footer>
      
      
    </div>
  )
}
