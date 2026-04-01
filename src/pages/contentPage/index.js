import './index.css';
import React, { useState, useEffect } from 'react';
import { get } from '../../utils/request';
import { Sid, Domain } from '../../utils/constant';
import { Tabs, Empty, Carousel } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { isEmpty, map } from 'lodash-es';
import { useGlobal } from '../contexts/GlobalContext';
import Banner from '../../assets/banner.jpg'

const ContentPage = ({ currentMenu, changeCurrentMenu, openPage, changeOpenPage }) => {
  const { globalField } = useGlobal();

  const [activeKey, setActiveKey] = useState('');
  const [tabTtems, setTabTtems] = useState([]);
  const [titleOne, setTitleOne] = useState('1');
  const [titleTwo, setTitleTwo] = useState('1');
  const [titleThree, setTitleThree] = useState('1');
  const [unreadNoticeList, setUnreadNoticeList] = useState([]);
  const [unfinishedProcessList, setUnfinishedProcessList] = useState([]);
  const [todoList, setTodoList] = useState([]);
  const [noticeList, setNoticeList] = useState([]);
  const [companySystemList, setCompanySystemList] = useState([]);

  useEffect(() => {
    getNoticeList();
    getCompanySystemList();
  }, [])

  // 添加格式化日期的方法
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      let date;
      if (dateStr.includes('-')) {
        // 处理类似 "2023-05-20" 或 "2023-05-20 14:30:00" 格式
        date = new Date(dateStr.replace(/-/g, '/'));
      } else if (!isNaN(dateStr)) {
        // 如果是纯数字时间戳格式
        date = new Date(parseInt(dateStr));
      } else {
        // 其他格式尝试直接解析
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) {
        console.error('无效日期:', dateStr);
        return dateStr;
      }
      
      // 格式化为 yyyy-mm-dd
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('日期格式化错误:', error, dateStr);
      return dateStr;
    }
  };

  useEffect(() => {
    if (globalField) {
      getTodoList(globalField.messageRefreshRate ? Number(globalField.messageRefreshRate) * 1000 : 30000);
      getUnreadNotice(globalField.messageRefreshRate ? Number(globalField.messageRefreshRate) * 1000 : 30000);
      getUnfinishedProcess(globalField.messageRefreshRate ? Number(globalField.messageRefreshRate) * 1000 : 30000);
    }
  }, [globalField])

  const getNoticeList = () => {
    get('/r/w', { cmd: 'com.fumiao.portal.cms', sid: Sid, type: '1' }).then((res) => {
      if (res.result === 'ok' && !isEmpty(res?.data?.datalist)) {
        const list = res.data.datalist.slice(0, 5);
        for (const key in list) {
          list[key].newTitle = list[key].title || list[key].msgTitle;
          list[key].time = formatDate(list[key].releaseTimeExt || list[key].releaseTime);
        }
        setNoticeList(list);
      }
    })
  };

  const getCompanySystemList = () => {
    get('/r/w', { cmd: 'com.fumiao.portal.cms', sid: Sid, type: '2' }).then((res) => {
      if (res.result === 'ok' && !isEmpty(res?.data?.datalist)) {
        const list = res.data.datalist.slice(0, 5);
        for (const key in list) {
          list[key].newTitle = list[key].title || list[key].msgTitle;
          list[key].time = formatDate(list[key].releaseTimeExt || list[key].releaseTime);
        }
        setCompanySystemList(list);
      }
    })
  };

  const getTodoList = (time) => {
    get('/r/w', { cmd: 'com.bono.portal.task.todoList', sid: Sid, serachWord: '', start: '1', limit: '5', }).then((res) => {
      if (res.result === 'ok' && !isEmpty(res?.data?.tasks)) {
        setTodoList(res.data.tasks);
      }
      setTimeout(() => {
        getTodoList(time);
      }, time);
    })
  };

  const getUnreadNotice = (time) => {
    get('/r/w', { cmd: 'com.awspaas.user.apps.feymer.newportal.getUnreadNotice', sid: Sid }).then((res) => {
      if (res.result === 'ok' && !isEmpty(res?.data)) {
        setUnreadNoticeList(res.data);
      }
      setTimeout(() => {
        getUnreadNotice(time);
      }, time);
    })
  };

  const getUnfinishedProcess = (time) => {
    get('/r/w', { cmd: 'com.awspaas.user.apps.feymer.newportal.getUnfinishedProcess', sid: Sid }).then((res) => {
      if (res.result === 'ok' && !isEmpty(res?.data)) {
        setUnfinishedProcessList(res.data);
      }
      setTimeout(() => {
        getUnfinishedProcess(time);
      }, time);
    })
  };

  // 点击菜单栏处理标签页
  useEffect(() => {
    if (currentMenu !== 'home') {
      const hasCurrentTab = tabTtems.some(obj => obj.key.includes(currentMenu));
      if (!hasCurrentTab) {
        let url = currentMenu.split('|')[2].replace('./w', '');
        url = `${Domain}/r/w${url}`
        tabTtems.push({
          label: <span title={currentMenu.split('|')[1]}>{currentMenu.split('|')[1]}</span>,
          children: <div className="contentPage">
            <iframe 
              src={url}
              className="content-iframe" 
              frameBorder="0">
            </iframe>
          </div>,
          key: currentMenu,
        })
        setTabTtems([...tabTtems])
      }
      setActiveKey(currentMenu);
    }
  }, [currentMenu])

  // 点击各模块打开标签页
  useEffect(() => {
    if (openPage.label) {
      const hasCurrentTab = tabTtems.some(obj => obj.key.includes(openPage.key));
      // 没有当前页面标签就添加标签
      if (!hasCurrentTab) {
        tabTtems.push({
          label: <span title={openPage.label}>{openPage.label}</span>,
          children: <div className="contentPage">
            <iframe 
              src={openPage.params ? `${openPage.key}${openPage.params}` : openPage.key}
              className="content-iframe" 
              frameBorder="0">
            </iframe>
          </div>,
          key: openPage.key
        })
        setTabTtems([...tabTtems])
      } else if (openPage.params) { // 有当前页面标签但是传参改变
        for (const i in tabTtems) {
          if (tabTtems[i].key === openPage.key) {
            tabTtems[i].children = <div className="contentPage">
              <iframe 
                src={`${openPage.key}${openPage.params}`}
                className="content-iframe" 
                frameBorder="0">
              </iframe>
            </div>
          }
        }
        setTabTtems([...tabTtems]);
      }
      changeCurrentMenu('');
      setTimeout(() => {
        setActiveKey(openPage.key);
      });
    }
  }, [openPage])

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
                  <span className={`title ${titleOne === '1' ? 'selectedTitle' : ''}`} onClick={() => setTitleOne('1')}>待办事项</span>
                  <span className={`title ${titleOne === '2' ? 'selectedTitle' : ''}`} onClick={() => setTitleOne('2')}>未读通知</span>
                  <span className={`title ${titleOne === '3' ? 'selectedTitle' : ''}`} onClick={() => setTitleOne('3')}>未结事项</span>
                </div>
                <div style={{ color: '#0142b8', cursor: 'pointer' }} onClick={() => {
                  let url = '';
                  let label = '';
                  if (titleOne === '1') {
                    label = '待办事项';
                    url = `${Domain}/r/w?sid=${Sid}&cmd=com.actionsoft.apps.workbench_main_page&boxName=todo`;
                  } else if (titleOne === '2') {
                    label = '未读通知';
                    url = `${Domain}/r/w?sid=${Sid}&cmd=com.actionsoft.apps.workbench_main_page&boxName=unreadNotice`;
                  } else {
                    
                    label = '未结事项';
                    url = `${Domain}/r/w?sid=${Sid}&cmd=CLIENT_DW_PORTAL&processGroupId=obj_d88ee0915c6f448ba708d28a82c97eb3&appId=com.awspaas.user.apps.feymer.newportal&dwViewId=obj_4c2d55438a6a4313af70a8d5315de350`;
                  }
                  changeOpenPage({
                    label: label,
                    key: url,
                  })
                }}>
                  <RightOutlined style={{ marginRight: 6 }} />更多
                </div>
              </div>
              <div className="itemBody">
                {/* <div className="tagList">
                  <span style={{ backgroundColor: '#0142b8', color: '#fff' }}>全部</span>
                  <span>财务共享平台</span>
                  <span>NC系统</span>
                  <span>投资管理平台</span>
                </div> */}
                {map(titleOne === '1' ? todoList : titleOne === '2' ? unreadNoticeList : unfinishedProcessList, (item, index) => {
                  return (
                    <div className="msgItem" key={index} onClick={() => {
                      if (titleOne === '1') {
                        let newUrl = item.openUrl.replace('./w', '');
                        changeOpenPage({
                          label: item.title,
                          key: `${Domain}/r/w${newUrl}`,
                        })
                      } else {
                        changeOpenPage({
                          label: item.title,
                          key: item.url,
                        })
                      }
                    }}>
                      <span
                        title={item.title}
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          paddingRight: 50
                        }}
                      >{item.title}</span>
                      <span style={{ flexShrink: 0 }}>{item.beginTime}</span>
                    </div>
                  )
                })}
                {((titleOne === '1' && isEmpty(todoList)) || (titleOne === '2' && isEmpty(unreadNoticeList)) || (titleOne === '3' && isEmpty(unfinishedProcessList))) && (
                  <Empty description="暂无数据~" style={{ marginTop: 20 }} />
                )}
              </div>
            </div>
            <div className="rightItem">
              <div className="itemHeader">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="labelIcon"></span>
                  <span className={`title ${titleTwo === '1' ? 'selectedTitle' : ''}`} onClick={() => setTitleTwo('1')}>通知公告</span>
                  <span className={`title ${titleTwo === '2' ? 'selectedTitle' : ''}`} onClick={() => setTitleTwo('2')}>公司制度</span>
                </div>
                <div style={{ color: '#0142b8', cursor: 'pointer' }} onClick={() => {
                  changeOpenPage({
                    label: '资讯中心',
                    key: `${Domain}/r/w?sid=${Sid}&cmd=com.actionsoft.apps.cms_site&siteid=${globalField.siteId}`,
                  })
                }}>
                  <RightOutlined style={{ marginRight: 6 }} />更多
                </div>
              </div>
              <div className="itemBody">
                 {map(titleTwo === '1' ? noticeList : companySystemList, (item, index) => {
                  return (
                    <div className="msgItem" key={index} onClick={() => {
                      changeOpenPage({
                        label: item.newTitle,
                        key: `${Domain}/r/w?sid=${Sid}&cmd=com.actionsoft.apps.cms_get_message&messageId=${item.messageId}`,
                      })
                    }}>
                      <span
                        title={item.title}
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          paddingRight: 50
                        }}
                      >{item.newTitle}</span>
                      <span style={{ flexShrink: 0 }}>{item.time}</span>
                    </div>
                  )
                })}
                {((titleTwo === '1' && isEmpty(noticeList)) || (titleTwo === '2' && isEmpty(companySystemList))) && (
                  <Empty description="暂无数据~" style={{ marginTop: 20 }} />
                )}
              </div>
            </div>
          </div>
          <div className="container">
            <div className="leftItem">
              <div className="itemHeader">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="labelIcon"></span>
                  <span className={`title ${titleThree === '1' ? 'selectedTitle' : ''}`} onClick={() => setTitleThree('1')}>公司新闻</span>
                  <span className={`title ${titleThree === '2' ? 'selectedTitle' : ''}`} onClick={() => setTitleThree('2')}>企业文化</span>
                </div>
                <div style={{ color: '#0142b8', cursor: 'pointer' }}onClick={() => {
                  changeOpenPage({
                    label: '资讯中心',
                    key: `${Domain}/r/w?sid=${Sid}&cmd=com.actionsoft.apps.cms_site&siteid=${globalField.siteId}`,
                  })
                }}><RightOutlined style={{ marginRight: 6 }} />更多</div>
              </div>
              <div className="newsBody">
                <Carousel arrows className="comPic" autoplay>
                  <div>
                    <h3
                      style={{
                        width: 300,
                        height: 156,
                        backgroundImage: `url(${Banner})`,
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        margin: 0
                      }}
                    >
                    </h3>
                  </div>
                  <div>
                    <h3
                      style={{
                        width: 300,
                        height: 156,
                        backgroundImage: `url(${Banner})`,
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        margin: 0
                      }}
                    >
                    </h3>
                  </div>
                  <div>
                    <h3
                      style={{
                        width: 300,
                        height: 156,
                        backgroundImage: `url(${Banner})`,
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        margin: 0
                      }}
                    >
                    </h3>
                  </div>
                </Carousel>
                <div className="newsList">
                  {/* <div className="newsItem" style={{ color: '#0142b8', fontWeight: 600 }}>
                    <span><span className="dot" style={{ backgroundColor: '#0142b8' }}></span>请审批<span className="newTag">NEW</span></span> */}
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
