package com.Judge_Mental.XorOJ.dto;

public record StandingCell(
    boolean firstSolved,
    Integer timeFromStartMin, // null if unsolved
    int rejections
) {}
