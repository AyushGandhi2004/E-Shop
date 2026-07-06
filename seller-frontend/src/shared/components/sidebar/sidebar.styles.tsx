'use client';
import styled from 'styled-components';

export const SidebarWrapper = styled.div`
    background-color: #f8f9fa;
    transition : transform 0.25s ease;
    height : 100%;
    position : fixed;
    transform : translateX(-100%);
    width : 16rem;
    flex-shrink : 0;
    z-index : 202;
    overflow-y : auto;
    border-right : 1px solid #dee2e6;
    flex-direction : column;
    padding-top : ;
    padding-bottom : ;
    padding-left : ;
    padding-right : ;
    
    
    ::webkit-scrollbar{
    display : none;
    }
    
    @media (min-width : 768px){
        margin-left: 0;
        display : flex;
        position : static;
        height : 100vh;
        transform : translateX(0);
    }

    ${(props : any)=>
        props.collapsed && 
        `
        display : inherit;
        margin-left : 0;
        transform : translateX(0);
        `
    }
    `;


    export const Overlay = styled.div`
        background-color : rgb(15,23,42,0.3);
        position : fixed;
        top :0;
        left:0;
        right:0;
        bottom:0;
        z-index : 201;
        transition : opacity 0.3s ease;
        opacity : 0.8;

        @media(min-width 768 px){
        display : none;
        z-index : auto;
        opacity : 1;
        }
    `;

    export const Header = styled.div`
        display : flex;
        gap : ;
        align-items : center;
        padding-left : ;
        padding-right : ;
    `

    export const Body = styled.div`
    display : flex;
    flex-direction : column;
    gap : ;
    margin-top : ;
    padding-left : ;
    padding-right : ;
    `;

    export const Footer = styled.div`
        justify-content : center;
        gap : ;
        padding-top : ;
        padding-bottom : ;
        padding-left : ;
        padding-right : ;

        @media (min-width : 768px){
        padding-top : 0;
        padding-bottom : 0;    
        }
    `;

    export const Sidebar = {
        Wrapper : SidebarWrapper,
        Header,
        Body,
        Overlay,
        Footer
    }