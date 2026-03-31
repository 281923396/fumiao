import './index.css';
import React, { useState, useEffect } from 'react';
import { get } from '../../utils/request';
import { Sid, Domain } from '../../utils/constant';
import { Tabs } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash-es';

const ContentPage = ({ currentMenu, changeCurrentMenu, openPage }) => {
  const [activeKey, setActiveKey] = useState('');
  const [tabTtems, setTabTtems] = useState([]);

  useEffect(() => {
    getData();
  }, [])

  useEffect(() => {
    if (currentMenu !== 'home') {
      console.log(currentMenu)
      const hasCurrentTab = tabTtems.some(obj => obj.key.includes(currentMenu));
      if (!hasCurrentTab) {
        let url = currentMenu.split('|')[2].replace('./w', '');
        url = `${Domain}/r/w${url}`
        tabTtems.push({
          label: currentMenu.split('|')[1],
          children: <div className="contentPage">
            <iframe 
              src={url}
              class="content-iframe" 
              frameborder="0">
            </iframe>
          </div>,
          key: currentMenu
        })
        setTabTtems([...tabTtems])
      }
      setActiveKey(currentMenu);
    }
  }, [currentMenu])

  useEffect(() => {
    if (openPage.label) {
      console.log(openPage)
      // const hasCurrentTab = tabTtems.some(obj => obj.key.includes(currentMenu));
      // if (!hasCurrentTab) {
      //   let url = currentMenu.split('|')[2].replace('./w', '');
      //   url = `${Domain}/r/w${url}`
      //   tabTtems.push({
      //     label: currentMenu.split('|')[1],
      //     children: <div className="contentPage">
      //       <iframe 
      //         src={url}
      //         class="content-iframe" 
      //         frameborder="0">
      //       </iframe>
      //     </div>,
      //     key: currentMenu
      //   })
      //   setTabTtems([...tabTtems])
      // }
      // setActiveKey(currentMenu);
    }
  }, [openPage])

  const getData = () => {
    // get('/r/w', { cmd: 'com.bono.portal.allnav', sid: Sid }).then((res) => {
    //   if (res.result === 'ok' && !isEmpty(res?.data)) {
        
    //   }
    // })
  };

  const remove = (targetKey) => {
    const targetIndex = tabTtems.findIndex(pane => pane.key === targetKey);
    const newPanes = tabTtems.filter(pane => pane.key !== targetKey);
    if (newPanes.length && targetKey === activeKey) {
      const { key } = newPanes[targetIndex === newPanes.length ? targetIndex - 1 : targetIndex];
      setActiveKey(key);
    }
    setTabTtems(newPanes);
    if (isEmpty(newPanes)) {
      changeCurrentMenu('home');
    }
  };

  const onChange = (key) => {
    setActiveKey(key);
  };

  const onEdit = (targetKey, action) => {
    if (action === 'remove') {
      remove(targetKey);
    }
  };

  return (
    <div>
      {currentMenu !== 'home' ? (
        <div>
          <Tabs
            hideAdd
            onChange={onChange}
            activeKey={activeKey}
            type="editable-card"
            onEdit={onEdit}
            items={tabTtems}
          />
        </div>
      ) : (
        <div className="contentPage">
          <div className="container">
            <div className="leftItem">
              <div className="itemHeader">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="labelIcon"></span>
                  <span className="title" style={{ color: '#312f30', fontWeight: 600 }}>待办事项</span>
                  <span className="title">未读通知</span>
                  <span className="title">未结事项</span>
                </div>
                <div style={{ color: '#0142b8', cursor: 'pointer' }}><RightOutlined style={{ marginRight: 6 }} />更多</div>
              </div>
              <div className="itemBody">
                {/* <div className="tagList">
                  <span style={{ backgroundColor: '#0142b8', color: '#fff' }}>全部</span>
                  <span>财务共享平台</span>
                  <span>NC系统</span>
                  <span>投资管理平台</span>
                </div> */}
                <div className="msgItem">
                  <span>请审批</span>
                  <span>2026-02-25</span>
                </div>
                <div className="msgItem">
                  <span>请审批</span>
                  <span>2026-02-25</span>
                </div>
                <div className="msgItem">
                  <span>请审批</span>
                  <span>2026-02-25</span>
                </div>
                <div className="msgItem">
                  <span>请审批</span>
                  <span>2026-02-25</span>
                </div>
                <div className="msgItem">
                  <span>请审批</span>
                  <span>2026-02-25</span>
                </div>
              </div>
            </div>
            <div className="rightItem">
              <div className="itemHeader">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="labelIcon"></span>
                  <span className="title" style={{ color: '#312f30', fontWeight: 600 }}>通知公告</span>
                  <span className="title">公司制定</span>
                </div>
                <div style={{ color: '#0142b8', cursor: 'pointer' }}><RightOutlined style={{ marginRight: 6 }} />更多</div>
              </div>
              <div className="itemBody">
                <div className="msgItem">
                  <span>请审批</span>
                  <span>2026-02-25</span>
                </div>
                <div className="msgItem">
                  <span>请审批</span>
                  <span>2026-02-25</span>
                </div>
                <div className="msgItem">
                  <span>请审批</span>
                  <span>2026-02-25</span>
                </div>
                <div className="msgItem">
                  <span>请审批</span>
                  <span>2026-02-25</span>
                </div>
                <div className="msgItem">
                  <span>请审批</span>
                  <span>2026-02-25</span>
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="leftItem">
              <div className="itemHeader">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="labelIcon"></span>
                  <span className="title" style={{ color: '#312f30', fontWeight: 600 }}>公司新闻</span>
                  <span className="title">企业文化</span>
                </div>
                <div style={{ color: '#0142b8', cursor: 'pointer' }}><RightOutlined style={{ marginRight: 6 }} />更多</div>
              </div>
              <div className="newsBody">
                <div className="comPic"></div>
                <div className="newsList">
                  <div className="newsItem" style={{ color: '#0142b8', fontWeight: 600 }}>
                    <span><span className="dot" style={{ backgroundColor: '#0142b8' }}></span>请审批<span className="newTag">NEW</span></span>
                    <span>2026-02-25</span>
                  </div>
                  <div className="newsItem">
                    <span><span className="dot"></span>请审批</span>
                    <span>2026-02-25</span>
                  </div>
                  <div className="newsItem">
                    <span><span className="dot"></span>请审批</span>
                    <span>2026-02-25</span>
                  </div>
                  <div className="newsItem">
                    <span><span className="dot"></span>请审批</span>
                    <span>2026-02-25</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rightItem">
              <div className="itemHeader">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="labelIcon"></span>
                  <span className="title" style={{ color: '#312f30', fontWeight: 600 }}>应用系统</span>
                </div>
                <div style={{ color: '#0142b8', cursor: 'pointer' }}><RightOutlined style={{ marginRight: 6 }} />更多</div>
              </div>
              <div className="systemBody">
                
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentPage;
