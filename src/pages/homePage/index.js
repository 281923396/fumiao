import TopMenu from '../topMenu';
import ContentPage from '../contentPage';
import './index.css';
import { Layout } from 'antd';
import React, { useState, useEffect } from 'react';
import { get, post } from '../../utils/request';
import Banner from '../../assets/banner.jpg'
import Config from '../../utils/constant';

const { Header, Content, Footer } = Layout;

const HomePage = () => {
  const { Sid, ModuleId, BaseUrl } = Config;

  const [currentMenu, setCurrentMenu] = useState('home');
  const [bannerUrl, setBannerUrl] = useState('');
  const [openPage, setOpenPage] = useState({});

  useEffect(() => {
    getBanner();
  }, [])

  const getBanner = () => {
    get('/r/w', { cmd: 'com.fumiao.portal.cms', sid: Sid, moduleId: ModuleId, type: 4 }).then((res) => {
      if (res.result === 'ok') {
        let imageUrl = '';
        if (res?.data?.datalist) {
          const data = res.data.datalist[0];
          if (data.titPicList && data.titPicList.length > 0 && data.titPicList[0].titPicUrl) {
            // 如果titPicUrl是相对路径
            const titPicUrl = data.titPicList[0].titPicUrl;
            if (titPicUrl.startsWith('./')) {
              // 移除开头的'./'，并使用正确的路径 - 只用一个df
              imageUrl = `${BaseUrl}/r${titPicUrl.substring(1)}`;
            } else {
              imageUrl = `${BaseUrl}/r${titPicUrl}`;
            }
          } else if (data.titlePicF && data.titlePicF.length > 0) {
            // 备选：使用titlePicF
            imageUrl = `${BaseUrl}/r/df?fileName=${data.titlePicF[0].fileName}&sid=${this.sid}`;
          } else if (data.msgTitlePic) {
            // 备选：使用msgTitlePic
            imageUrl = `${BaseUrl}/r/df?fileName=${data.msgTitlePic}&sid=${this.sid}`;
          } else {
            // 默认图片
            imageUrl = Banner;
          }
        } else {
          imageUrl = Banner;
        }
        setBannerUrl(imageUrl);
      }
    })
  };

  return (
    <div className="homePage" id="homePage">
      <Layout style={{ minHeight: '100vh' }}>
        <Header
          style={{
            height: currentMenu === 'home' ? 600 : 64,
            backgroundColor: currentMenu === 'home' ? '' : '#418ff3',
            backgroundImage: currentMenu === 'home' ? `url(${bannerUrl})` : '',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center'
          }}
        >
          <TopMenu
            currentMenu={currentMenu}
            changeCurrentMenu={(value) => {
              setCurrentMenu(value);
            }}
            changeOpenPage={(data) => {
              setOpenPage(data);
            }}
          />
        </Header>
        <Content style={{ backgroundColor: 'rgb(236, 234, 235, 0.3)' }}>
          <ContentPage
            currentMenu={currentMenu}
            openPage={openPage}
            changeCurrentMenu={(value) => {
              setCurrentMenu(value);
            }}
            changeOpenPage={(data) => {
              setOpenPage(data);
            }}
          />
        </Content>
      </Layout>
    </div>
  );
}

export default HomePage;