import './index.css';
import React, { useState, useEffect } from 'react';
import { Menu, Image, Dropdown, Input, Modal, message } from 'antd';
import Logo from '../../assets/logo.png';
import { get, post } from '../../utils/request';
import { Sid, Domain } from '../../utils/constant';
import { BellFilled, SearchOutlined, CaretDownOutlined } from '@ant-design/icons';
import { isEmpty, cloneDeep } from 'lodash-es';
import { useGlobal } from '../contexts/GlobalContext';

const { Search } = Input;

const userItem = [
  {
    label: "修改登录口令",
    key: '1',
  },
  {
    label: "退出登录",
    key: '2',
  },
];

const typeList = [
  {
    label: '流程',
    key: '流程',
  },
  {
    label: '应用',
    key: '应用',
  },
  {
    label: '信息',
    key: '信息',
  },
  {
    label: '知识',
    key: '知识',
  },
  {
    label: '人员',
    key: '人员',
  },
];

const TopMenu = ({ currentMenu, changeCurrentMenu, changeOpenPage }) => {
  const { globalField } = useGlobal();

  const [menuItem, setMenuItem] = useState([{
    label: '门户',
    key: 'home',
  }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginoutOpen, setLoginoutOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [unread, setUnread] = useState(false);
  const [type, setType] = useState('流程');
  const [passWord, setPassWord] = useState({
    old: '',
    new: '',
    renew: '',
  });

  useEffect(() => {
    getAllMenu();
  }, [])

  useEffect(() => {
    if (globalField) {
      getUnreadList(globalField.messageRefreshRate ? Number(globalField.messageRefreshRate) * 1000 : 30000);
    }
  }, [globalField])

  const onTitleClick = (e) => {
    changeCurrentMenu(e.key);
  };

  // 获取所有菜单
  const getAllMenu = () => {
    get('/r/w', { cmd: 'com.bono.portal.allnav', sid: Sid }).then((res) => {
      if (res.result === 'ok' && !isEmpty(res?.data?.nav)) {
        const nav = res.data.nav;
        for (const i in nav) {
          nav[i].label = nav[i].name;
          nav[i].key = `${nav[i].id}|${nav[i].name}|${nav[i].url}`;
          if (nav[i].url && nav[i].url !== '/') {
            nav[i].onTitleClick =  onTitleClick;
          }
          if (!isEmpty(nav[i].directory)) {
            nav[i].children = nav[i].directory;
            const directory = nav[i].directory;
            for (const j in directory) {
              directory[j].label = directory[j].name;
              directory[j].key = `${directory[j].id}|${directory[j].name}|${directory[j].url}`;
              if (directory[j].url && directory[j].url !== '/') {
                directory[j].onTitleClick =  onTitleClick;
              }
              if (!isEmpty(directory[j].function)) {
                directory[j].children = directory[j].function;
                const functionList = directory[j].function;
                for (const m in functionList) {
                  functionList[m].label = functionList[m].name;
                  functionList[m].key = `${functionList[m].id}|${functionList[m].name}|${functionList[m].url}`;
                  if (!functionList[m].url || functionList[m].url === '/') {
                    functionList[m].disabled =  true;
                  }
                }
              } else if (!directory[j].url || directory[j].url === '/') {
                directory[j].disabled =  true;
              }
            }
          } else if (!nav[i].url || nav[i].url === '/') {
            nav[i].disabled =  true;
          }
        }
        const list = menuItem.concat(nav);
        setMenuItem(list);
      }
    })
  };

  const getUnreadList = (time) => {
    get('/r/w', { cmd: 'com.actionsoft.apps.notification_load_unread_msg', sid: Sid }).then((res) => {
      if (res.result === 'ok') {
        if (!isEmpty(res?.data?.list)) {
          setUnread(true);
        } else {
          setUnread(false);
        }
      }
      setTimeout(() => {
        getUnreadList(time);
      }, time);
    })
  };

  const onClick = (e) => {
    changeCurrentMenu(e.key);
  };

  const clickUser = (e) => {
    if (e.key === '2') {
      setLoginoutOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const changePassword = () => {
    if (!passWord.old) {
      message.warning('请输入旧口令！');
      return;
    }
    if (!passWord.new) {
      message.warning('请输入新口令！');
      return;
    }
    if (!passWord.renew) {
      message.warning('请输入确认口令！');
      return;
    }
    if (passWord.new === passWord.old) {
      message.warning('新口令和旧口令不能一样！');
      return;
    }
    if (passWord.new !== passWord.renew) {
      message.warning('新口令和确认口令不一致！');
      return;
    }
    post(`/r/w?cmd=CLIENT_UPDATE_PASSWORD&sid=${Sid}`,
      { oldPassword: passWord.old, password: passWord.new, confirmPassword: passWord.renew },
      { contentType: 'application/x-www-form-urlencoded' }
    ).then((res) => {
      if (res.result === 'ok') {
        window.location.reload();
      }
    })
  };

  const selectType = ({ key }) => {
    setType(key);
  };

  return (
    <div className="topMenu" onClick={() => setShowSearch(false)}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
        <div style={{ display: 'flex', flex: 1 }}>
          <Image src={Logo} width={120} height={55} preview={false} />
          <Menu
            onClick={onClick}
            selectedKeys={[currentMenu]}
            mode="horizontal"
            items={menuItem}
            getPopupContainer={() => document.getElementById('homePage')}
            // getPopupContainer={(triggerNode) => triggerNode.parentNode}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'relative' }}>
            <BellFilled style={{ color: '#fff', fontSize: '20px', cursor: 'pointer' }}
              onClick={() => {
                changeOpenPage({
                  label: '通知',
                  key: `${Domain}/r/w?sid=${Sid}&cmd=com.actionsoft.apps.notification_center`
                })
              }}
            />
            {unread && (
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#f04134',
                position: 'absolute',
                right: 0,
                top: 16,
                display: 'block'
              }}></span>
            )}
          </span>
          {showSearch ? (
            <div className="searchItem" onClick={(e) => {
                setShowSearch(true);
                e.stopPropagation();
              }}
            >
              <Dropdown menu={{ items: typeList, onClick: selectType }} trigger={['click']}>
                <span className="selectType">
                  <span style={{ marginRight: 5 }}>{type}</span>
                  <CaretDownOutlined />
                </span>
              </Dropdown>
              <Input
                placeholder=""
                allowClear
                style={{ width: 170, border: 'none', backgroundColor: 'transparent' }}
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (searchValue) {
                      changeOpenPage({
                        label: '搜索',
                        key: `${Domain}/r/w?sid=${Sid}&cmd=com.actionsoft.apps.elasticsearch_searchresultpage`,
                        params: `&searchWords=${searchValue}&name=${type}`
                      })
                    }
                  }
                }}
              />
              <SearchOutlined
                style={{ color: '#fff', fontSize: '20px', cursor: 'pointer' }}
                onClick={() => {
                  if (searchValue) {
                    changeOpenPage({
                      label: '搜索',
                      key: `${Domain}/r/w?sid=${Sid}&cmd=com.actionsoft.apps.elasticsearch_searchresultpage`,
                      params: `&searchWords=${searchValue}&name=${type}`
                    })
                  }
                }}
              />
            </div>
          ) : (
            <SearchOutlined style={{ color: '#fff', fontSize: '20px', cursor: 'pointer', margin: '0 20px' }} onClick={(e) => {
              setShowSearch(true);
                e.stopPropagation();
              }}
            />
          )}
          <Dropdown menu={{ items: userItem, onClick: clickUser }} trigger={['click']}>
            <div
              style={{
                width: 40,
                height: 40,
                backgroundImage: `url(${globalField?.avatorUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '50%',
                cursor: 'pointer'
              }}
            ></div>
          </Dropdown>
        </div>
      </div>
      <Modal
        title="修改登录口令"
        open={isModalOpen}
        onOk={() => changePassword()}
        maskClosable={false}
        okText="确定"
        cancelText="取消"
        onCancel={() => setIsModalOpen(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
          <span style={{ display: 'inline-block', width: 80 }}>旧口令</span>
          <span style={{ color: '#f04134', marginRight: 5 }}>*</span>
          <Input.Password
            style={{ width: 300 }}
            value={passWord.old}
            onChange={(e) => {
              const data = cloneDeep(passWord);
              data.old = e.target.value;
              setPassWord(data);
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
          <span style={{ display: 'inline-block', width: 80 }}>新口令</span>
          <span style={{ color: '#f04134', marginRight: 5 }}>*</span>
          <Input.Password
            style={{ width: 300 }}
            value={passWord.new}
            onChange={(e) => {
              const data = cloneDeep(passWord);
              data.new = e.target.value;
              setPassWord(data);
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
          <span style={{ display: 'inline-block', width: 80 }}>确认口令</span>
          <span style={{ color: '#f04134', marginRight: 5 }}>*</span>
          <Input.Password
            style={{ width: 300 }}
            value={passWord.renew}
            onChange={(e) => {
              const data = cloneDeep(passWord);
              data.renew = e.target.value;
              setPassWord(data);
            }}
          />
        </div>
      </Modal>
      <Modal
        title="提示"
        open={loginoutOpen}
        onOk={() => {
          window.location.href = `${Domain}/r/w?sid=${Sid}&cmd=CLIENT_USER_INFO_LOGOUT`;
        }}
        maskClosable={false}
        okText="确定"
        cancelText="取消"
        onCancel={() => setLoginoutOpen(false)}
      >
        确认离开系统吗？
      </Modal>
    </div>
  );
}

export default TopMenu;
