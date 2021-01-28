import React, {memo, useState, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
  TouchableWithoutFeedback
} from 'react-native';


if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const ReadMore = ({
  numberOfLines,
  style,
  wrapperStyle,
  children,
  seeMoreStyle,
  seeMoreText,
  seeLessStyle,
  seeLessText,
  animate,
  backgroundColor,
  customTextComponent: TextComponent,
  ellipsis,
  allowFontScaling,
  ...restProps
}) => {
  const [textHeight, setTextHeight] = useState(0);
  const [hiddenTextHeight, setHiddenTextHeight] = useState(0);
  const [
    hiddenTextHeightWithSeeLess,
    setHiddenTextHeightWithSeeLess,
  ] = useState(0);
  const [mountHiddenTextOne, setMountHiddenTextOne] = useState(true);
  const [mountHiddenTextTwo, setMountHiddenTextTwo] = useState(true);
  const [seeMore, setSeeMore] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [afterCollapsed, setAfterCollapsed] = useState(true);

  const onTextLayout = useCallback(
    ({
      nativeEvent: {
        layout: {height},
      },
    }) => {
      setTextHeight(height);
    },
    [setTextHeight],
  );

  const onHiddenTextLayout = useCallback(
    ({
      nativeEvent: {
        layout: {height},
      },
    }) => {
      setHiddenTextHeight(height);
      setMountHiddenTextOne(false);
    },
    [setHiddenTextHeight, setMountHiddenTextOne],
  );

  const onHiddenSeeLessTextLayoutTwo = useCallback(
    ({
      nativeEvent: {
        layout: {height},
      },
    }) => {
      setHiddenTextHeightWithSeeLess(height);
      setMountHiddenTextTwo(false);
    },
    [setHiddenTextHeightWithSeeLess, setMountHiddenTextTwo],
  );

  const toggle = useCallback(() => {
    setCollapsed((prev) => !prev);
    if (animate) {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          300,
          LayoutAnimation.Types.linear,
          LayoutAnimation.Properties.opacity,
        ),
      );
    }
  }, [setCollapsed, animate]);

  useEffect(() => {
    if (!hiddenTextHeight || !textHeight) {
      return;
    }

    setSeeMore(hiddenTextHeight > textHeight);
  }, [textHeight, hiddenTextHeight]);

  useEffect(() => {
    setAfterCollapsed(collapsed);
  }, [collapsed]);

  useEffect(() => {
    setMountHiddenTextOne(true);
    setMountHiddenTextTwo(true);
  }, [
    numberOfLines,
    style,
    wrapperStyle,
    children,
    seeMoreStyle,
    seeMoreText,
    seeLessStyle,
    seeLessText,
    ellipsis,
    allowFontScaling,
  ]);

  const textProps = collapsed
    ? {
        onLayout: onTextLayout,
        numberOfLines,
        ellipsizeMode: 'tail',
      }
    : {};

  const additionalProps = {};
  if (allowFontScaling !== undefined) {
    additionalProps.allowFontScaling = allowFontScaling;
  }

  return (
    <>
    <View>
      {/* text component to measure see if see more is applicable and get height */}
      {mountHiddenTextOne && (
        <TextComponent
          {...additionalProps}
          style={StyleSheet.flatten([
            Array.isArray(style) ? StyleSheet.flatten(style) : style,
            styles.hiddenTextAbsolute,
          ])}
          ellipsizeMode={'clip'}
          onLayout={onHiddenTextLayout}>
          {children || ''}
        </TextComponent>
      )}
      {/* text component to measure height with see less */}
      {mountHiddenTextTwo && (
        <TextComponent
          {...additionalProps}
          style={StyleSheet.flatten([
            Array.isArray(style) ? StyleSheet.flatten(style) : style,
            styles.hiddenTextAbsolute,
          ])}
          onLayout={onHiddenSeeLessTextLayoutTwo}>
          {children || ''}
          {` ${seeLessText}`}
        </TextComponent>
      )}
      <TextComponent
        {...additionalProps}
        {...restProps}
        style={style}
        {...textProps}>
        {children || ''}
     
      </TextComponent>
    </View>
    <View>
    {seeMore && !collapsed && (
          <TouchableWithoutFeedback onPress={toggle}>
            <View style={{backgroundColor}}>
          <TextComponent
            {...additionalProps}
            {...restProps}
            style={seeLessStyle}>
            {hiddenTextHeightWithSeeLess > hiddenTextHeight ? '\n' : ' '}
            {seeLessText}
          </TextComponent>
          </View>
          </TouchableWithoutFeedback>
        )}
    {seeMore && collapsed && afterCollapsed && (
        <TouchableWithoutFeedback onPress={toggle}>
        <View style={[styles.seeMoreContainer, {backgroundColor}]}>
          <TextComponent
            {...additionalProps}
            {...restProps}
            style={[style, seeMoreStyle]}>
            {  `${seeMoreText}`}
          </TextComponent>
        </View>
        </TouchableWithoutFeedback>
      )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  hiddenTextAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    color: 'transparent',
  },
  seeMoreContainer: {
    flexDirection: 'row',
  },
  seeMoreButton: {
    flexDirection: 'row',
  },
  defaultText: {},
  seeMoreText: {
    color: 'red',
    fontWeight: 'bold',
  },
  seeLessText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

ReadMore.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  seeMoreStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  seeLessStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  wrapperStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.any,
  numberOfLines: PropTypes.number,
  seeMoreText: PropTypes.string,
  seeLessText: PropTypes.string,
  animate: PropTypes.bool,
  backgroundColor: PropTypes.string,
  customTextComponent: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.element,
    PropTypes.elementType,
  ]),
  ellipsis: PropTypes.string,
  allowFontScaling: PropTypes.bool,
};

ReadMore.defaultProps = {
  style: styles.defaultText,
  seeMoreStyle: StyleSheet.flatten([styles.defaultText, styles.seeMoreText]),
  seeLessStyle: StyleSheet.flatten([styles.defaultText, styles.seeLessText]),
  wrapperStyle: styles.container,
  text: '',
  numberOfLines: 3,
  seeMoreText: 'See more',
  seeLessText: 'See less',
  animate: false,
  backgroundColor: 'white',
  customTextComponent: Text,
  ellipsis: '...',
};

export default memo(ReadMore);
