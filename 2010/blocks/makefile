FC = ../scripts/fc
FFLAGS = \
-default-size 760 720 \
-default-background-color 0xffffff \
-default-frame-rate 30 \
-headless-server \
-library-path+=../aslibs \
-source-path=.. \
--
AS_SRCS = \
BlocksApp.as \
BlocksGameState.as \
BlocksGameView.as


all : Blocks.swf

Blocks.swf : $(AS_SRCS) Blocks.mxml
	$(FC) $(FFLAGS) Blocks.mxml ; cp Blocks.swf ../web/media/

